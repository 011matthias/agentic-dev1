#!/usr/bin/env python3
"""PostToolUse(Write|Edit): auto-strip the em-dash character from dev1 markdown.

Scope: dev1-authored markdown prose (docs, READMEs, rules, memory, product
markdown), excluding vendored/generated trees (node_modules, dist, build) and
vendored skill dirs that ship a LICENSE.txt (kept byte-faithful). This
is the internal knowledge base read at every session start and understand-phase;
the em-dash is the strongest autocomplete tell and is mechanically removable, so
it is removed rather than remembered. See rule_anti_slop.md.

The ` -- ` double-hyphen is intentionally NOT stripped: in a code/CLI repo it is
a legitimate end-of-options separator. tools/strip-em-dash.py handles only the
em-dash character; this hook just routes dev1 markdown into it.

Why a mutating hook and not advisory: the consultancy version of this rule needed
post-hoc validator cleanup three sessions running (recall failure x3). Auto-strip
removes the recall dependency entirely (Layer-1 self-anneal: tool over memory).

Non-blocking: runs tools/strip-em-dash.py, emits a systemMessage if it changed
anything, never exits 2.
"""
import datetime
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
STRIP_TOOL = REPO / "tools" / "strip-em-dash.py"
HOOK_LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hook-log.txt")


def log_fire(action: str) -> None:
    try:
        with open(HOOK_LOG, "a", encoding="utf-8") as f:
            f.write(f"{datetime.datetime.now().isoformat()} em-dash-strip-gate {action}\n")
    except Exception:
        pass


def normalize_path(file_path: str) -> str:
    """/c/Users/... -> C:/Users/... (Git-Bash style to Windows)."""
    if not file_path:
        return file_path
    if len(file_path) >= 3 and file_path[0] == "/" and file_path[2] == "/" and file_path[1].isalpha():
        file_path = f"{file_path[1].upper()}:{file_path[2:]}"
    return file_path


def _is_vendored_skill_doc(file_path: str) -> bool:
    """True for markdown inside a `.claude/skills/<skill>/` dir that ships a
    LICENSE.txt: a third-party skill vendored verbatim (e.g. an Apache-2.0 skill
    from anthropics/skills). Apache-2.0 requires the licensed work be retained, so
    these stay byte-faithful and out of the em-dash discipline, which targets
    dev1-authored prose. Authored skills (skil_*) ship no LICENSE.txt and stay in
    scope.
    """
    parts = Path(file_path).parts
    lower = [seg.lower() for seg in parts]
    for k in range(len(lower) - 2):
        if lower[k] == ".claude" and lower[k + 1] == "skills":
            return (Path(*parts[: k + 3]) / "LICENSE.txt").is_file()
    return False


def in_dev1_doc_scope(file_path: str) -> bool:
    """True for dev1-authored markdown prose: docs, READMEs, rules, memory,
    product markdown. The em-dash discipline (rule_anti_slop) covers the whole
    internal knowledge base, not a client-facing subset (dev1 has no clients).

    Match: any `.md` / `.markdown` / `.mdx`.
    Exclude: non-markdown (code keeps its own dashes); vendored / generated trees
    (node_modules, dist, build, .git); and vendored skill dirs that ship a
    LICENSE.txt (kept byte-faithful) that dev1 did not author.
    """
    if not file_path:
        return False
    p = file_path.replace("\\", "/").lower()
    if not p.endswith((".md", ".markdown", ".mdx")):
        return False
    if any(seg in p for seg in ("/node_modules/", "/dist/", "/build/", "/.git/")):
        return False
    if _is_vendored_skill_doc(file_path):
        return False
    return True


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool_input = payload.get("tool_input") or {}
    tool_response = payload.get("tool_response") or {}
    raw = tool_input.get("file_path") or tool_response.get("filePath") or ""
    file_path = normalize_path(raw)

    if not in_dev1_doc_scope(file_path):
        sys.exit(0)
    if not Path(file_path).is_file() or not STRIP_TOOL.is_file():
        sys.exit(0)

    try:
        proc = subprocess.run(
            ["uv", "run", str(STRIP_TOOL), file_path],
            capture_output=True, text=True, encoding="utf-8",
            errors="replace", timeout=30, cwd=str(REPO),
        )
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError) as e:
        log_fire(f"ERROR:{type(e).__name__}")
        sys.exit(0)

    out = (proc.stdout or "").strip()
    # strip-em-dash.py prints e.g. "Total: replaced 2, 0 em-dashes remain".
    m = re.search(r"replaced\s+(\d+)", out)
    changed = bool(m) and int(m.group(1)) > 0
    log_fire(f"ran:{Path(file_path).name}:{'changed' if changed else 'clean'}")

    if changed:
        msg = (
            f"em-dash-strip-gate: auto-stripped em-dashes from {Path(file_path).name} "
            f"(dev1 markdown). {out.splitlines()[-1] if out else ''}".strip()
        )
        print(json.dumps({
            "systemMessage": msg,
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": (
                    f"NOTE: {Path(file_path).name} had em-dashes auto-stripped by the "
                    f"em-dash-strip-gate hook (dev1 prose; rule_anti_slop). The file on "
                    f"disk now differs from your last write. Re-read before further edits "
                    f"to that region."
                ),
            },
        }))
    sys.exit(0)


if __name__ == "__main__":
    main()
