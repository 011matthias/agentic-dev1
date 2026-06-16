"""em-dash-strip-gate (PostToolUse:Write|Edit): strips the em-dash character
from dev1 markdown prose (Cycle 3 scope).

Unit-tests the scope classifier (the part most likely to regress when the scope
set changes), plus three end-to-end tests: an in-scope markdown file gets its
em-dash stripped on disk; a ` -- ` CLI separator survives (the dev1 divergence
from the consultancy zero-double-hyphen rule); a non-markdown file is left
untouched and the hook stays silent.

The end-to-end strip path shells out to `uv run tools/strip-em-dash.py`, so it
requires uv on PATH (CI installs it; local dev has it).
"""
import importlib.util

from hooklib import HOOKS, run_hook

_spec = importlib.util.spec_from_file_location(
    "em_dash_strip_gate", HOOKS / "em-dash-strip-gate.py"
)
edg = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(edg)


def test_scope_includes_dev1_markdown():
    assert edg.in_dev1_doc_scope("/x/docs/sessions/2026-06-09.md")
    assert edg.in_dev1_doc_scope("/x/README.md")
    assert edg.in_dev1_doc_scope("/x/products/crew/ARCHITECTURE.md")
    assert edg.in_dev1_doc_scope("/x/memory/project_crew_game.md")
    assert edg.in_dev1_doc_scope("/x/.claude/rules/rule_anti_slop.md")


def test_scope_excludes_non_markdown_and_vendored():
    assert not edg.in_dev1_doc_scope("/x/tools/foo.py")
    assert not edg.in_dev1_doc_scope("/x/products/crew/index.html")
    assert not edg.in_dev1_doc_scope("/x/products/crew/node_modules/pkg/readme.md")
    assert not edg.in_dev1_doc_scope("/x/products/crew/dist/report.md")
    assert not edg.in_dev1_doc_scope("")


def test_scope_excludes_vendored_skill_with_license(tmp_path):
    # A vendored skill ships a LICENSE.txt; its markdown stays byte-faithful and
    # out of the em-dash discipline (Apache-2.0 retention).
    skill = tmp_path / ".claude" / "skills" / "frontend-design"
    skill.mkdir(parents=True)
    (skill / "LICENSE.txt").write_text("Apache License 2.0\n", encoding="utf-8")
    md = skill / "SKILL.md"
    md.write_text("Follow it exactly — the brief wins.\n", encoding="utf-8")
    assert not edg.in_dev1_doc_scope(str(md))


def test_scope_includes_authored_skill_without_license(tmp_path):
    # Authored skills (skil_*, no LICENSE.txt) keep the em-dash discipline.
    skill = tmp_path / ".claude" / "skills" / "skil_game-feel-review"
    skill.mkdir(parents=True)
    md = skill / "SKILL.md"
    md.write_text("Body text.\n", encoding="utf-8")
    assert edg.in_dev1_doc_scope(str(md))


def test_normalize_path_gitbash_drive():
    assert edg.normalize_path("/c/Users/x/file.md") == "C:/Users/x/file.md"


def test_end_to_end_strips_em_dash_in_dev1_markdown(tmp_path):
    f = tmp_path / "notes.md"
    f.write_text("Phase 1 — ready for your review.\n", encoding="utf-8")
    run_hook("em-dash-strip-gate.py", {"tool_input": {"file_path": str(f)}})
    assert "—" not in f.read_text(encoding="utf-8")


def test_end_to_end_preserves_double_hyphen_cli_separator(tmp_path):
    # ` -- ` is a legitimate CLI end-of-options separator in this repo and must
    # survive the gate (the dev1 divergence from the consultancy rule).
    f = tmp_path / "runbook.md"
    f.write_text("Run `git ls-tree <rev> -- <path>` to check existence.\n",
                 encoding="utf-8")
    run_hook("em-dash-strip-gate.py", {"tool_input": {"file_path": str(f)}})
    assert " -- " in f.read_text(encoding="utf-8")


def test_end_to_end_skips_non_markdown(tmp_path):
    f = tmp_path / "script.py"  # not markdown -> out of scope, code keeps its dashes
    f.write_text("x = 1  # phase 1 — ready\n", encoding="utf-8")
    p = run_hook("em-dash-strip-gate.py", {"tool_input": {"file_path": str(f)}})
    assert "—" in f.read_text(encoding="utf-8")  # untouched
    assert p.stdout.strip() == ""


def test_end_to_end_preserves_em_dash_in_vendored_skill(tmp_path):
    # A vendored skill's markdown (sibling LICENSE.txt) must survive verbatim:
    # editing it would diverge from upstream and break Apache-2.0 retention.
    skill = tmp_path / ".claude" / "skills" / "webapp-testing"
    skill.mkdir(parents=True)
    (skill / "LICENSE.txt").write_text("Apache License 2.0\n", encoding="utf-8")
    md = skill / "SKILL.md"
    md.write_text("Wait for networkidle — critical on dynamic apps.\n",
                  encoding="utf-8")
    run_hook("em-dash-strip-gate.py", {"tool_input": {"file_path": str(md)}})
    assert "—" in md.read_text(encoding="utf-8")  # vendored: untouched
