"""scaffold.py: the Cycle-7 template stamper.

Pins the stamp contract (overlay order, token substitution, the dev1 manifest
block) and every refusal guard (bad archetype/name, stub archetype, existing
product). Stamps into tmp_path against the real templates/ tree, so a template
rename or a token regression is caught here, not at scaffold time.
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
MOD_PATH = REPO / "tools" / "scaffold.py"


def _load():
    spec = importlib.util.spec_from_file_location("scaffold", MOD_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


SCAF = _load()
TEMPLATES = SCAF.TEMPLATES


def test_title_from_slug():
    assert SCAF.title_from_slug("my-cool-game") == "My Cool Game"
    assert SCAF.title_from_slug("demo") == "Demo"


def test_stamp_game_is_well_formed(tmp_path):
    dest, written = SCAF.scaffold(
        "game", "my-game", products_root=tmp_path, templates_root=TEMPLATES
    )
    # Overlay: _shared skeletons + the archetype stack, archetype winning.
    for required in ("ARCHITECTURE.md", "README.md", "PRODUCT.md", "package.json",
                     "index.html", "src/main.ts", ".gitignore"):
        assert (dest / required).is_file(), f"missing {required}"
    assert "package.json" in written

    pkg = json.loads((dest / "package.json").read_text(encoding="utf-8"))
    assert pkg["name"] == "my-game"
    assert pkg["dev1"]["archetype"] == "game"
    assert "verify" in pkg["scripts"]


def test_tokens_fully_substituted(tmp_path):
    dest, _ = SCAF.scaffold(
        "game", "my-game", products_root=tmp_path, templates_root=TEMPLATES,
        title="My Game",
    )
    # No template placeholder may survive in any stamped text file.
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, ValueError):
            continue
        assert "{{" not in text, f"unsubstituted token in {path.name}"
        assert "dev1-template-" not in text, f"name placeholder left in {path.name}"
    assert "My Game" in (dest / "README.md").read_text(encoding="utf-8")


def test_title_defaults_from_slug(tmp_path):
    dest, _ = SCAF.scaffold(
        "game", "space-rocks", products_root=tmp_path, templates_root=TEMPLATES
    )
    assert "Space Rocks" in (dest / "README.md").read_text(encoding="utf-8")


def test_dry_run_writes_nothing(tmp_path):
    dest, written = SCAF.scaffold(
        "game", "ghost", products_root=tmp_path, templates_root=TEMPLATES,
        dry_run=True,
    )
    assert written, "dry run should still report the file list"
    assert not dest.exists(), "dry run must not write the product"


def test_rejects_unknown_archetype(tmp_path):
    with pytest.raises(SCAF.ScaffoldError):
        SCAF.scaffold("backend", "x", products_root=tmp_path, templates_root=TEMPLATES)


def test_rejects_invalid_name(tmp_path):
    for bad in ("Bad_Name", "-leading", "has space", "UPPER"):
        with pytest.raises(SCAF.ScaffoldError):
            SCAF.scaffold("game", bad, products_root=tmp_path, templates_root=TEMPLATES)


def test_rejects_stub_archetype(tmp_path):
    # website/app ship a README but no package.json yet: must refuse, not stamp half.
    with pytest.raises(SCAF.ScaffoldError):
        SCAF.scaffold("website", "site", products_root=tmp_path, templates_root=TEMPLATES)


def test_refuses_to_overwrite_existing_product(tmp_path):
    (tmp_path / "taken").mkdir()
    with pytest.raises(SCAF.ScaffoldError):
        SCAF.scaffold("game", "taken", products_root=tmp_path, templates_root=TEMPLATES)


def test_rejects_title_carrying_a_token(tmp_path):
    # A title is the only user-controlled substitution value; one containing a
    # token would otherwise leak a placeholder into a stamped file.
    for bad in ("{{PRODUCT_NAME}}", "dev1-template-game"):
        with pytest.raises(SCAF.ScaffoldError):
            SCAF.scaffold("game", "x", products_root=tmp_path, templates_root=TEMPLATES,
                          title=bad)
