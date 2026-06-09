"""check-architecture.py: the understand-before-change gate.

Pins both halves of the gate. The real-repo case guards every shipped
product's ARCHITECTURE map in CI (a rename that desyncs the map fails here);
the tmp-dir cases pin the existence + freshness FAIL boundary so a regex tweak
cannot silently reopen the hole.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MOD_PATH = REPO / "tools" / "check-architecture.py"


def _load():
    spec = importlib.util.spec_from_file_location("check_architecture", MOD_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


CA = _load()


def test_referenced_paths_extracts_concrete_skips_globs_and_templates():
    text = "`src/App.tsx` `src/modes/*.tsx` `modes/<Name>.tsx` `crew_logs_v1` `src/kernel.tsx`"
    assert CA.referenced_paths(text) == ["src/App.tsx", "src/kernel.tsx"]


def test_referenced_paths_dedupes():
    assert CA.referenced_paths("`src/a.ts` `src/a.ts`") == ["src/a.ts"]


def test_real_repo_products_pass():
    # Every shipped product's ARCHITECTURE map must stay true to its tree.
    roots = CA.discover_products()
    assert roots, "no products discovered; the gate would be vacuously green"
    for root in roots:
        assert CA.check_product(root) == [], f"{root.name} ARCHITECTURE map drifted"


def test_missing_required_doc_flags(tmp_path):
    (tmp_path / "ARCHITECTURE.md").write_text("# x\n", encoding="utf-8")
    findings = CA.check_product(tmp_path)
    assert any("missing README.md" in f for f in findings)


def test_dangling_map_path_flags(tmp_path):
    (tmp_path / "README.md").write_text("# x\n", encoding="utf-8")
    (tmp_path / "ARCHITECTURE.md").write_text("map: `src/gone.ts`\n", encoding="utf-8")
    findings = CA.check_product(tmp_path)
    assert any("src/gone.ts" in f for f in findings)


def test_accurate_map_passes(tmp_path):
    (tmp_path / "README.md").write_text("# x\n", encoding="utf-8")
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "here.ts").write_text("//\n", encoding="utf-8")
    (tmp_path / "ARCHITECTURE.md").write_text("map: `src/here.ts`\n", encoding="utf-8")
    assert CA.check_product(tmp_path) == []
