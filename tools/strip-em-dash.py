#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Strip em-dashes (` — `) from prose in markdown files.

Replaces ` — ` (space, em-dash, space) with `; ` (semicolon, space) in prose
lines. Skips fenced code blocks (``` ... ```) so legitimate dash usage in code
stays intact. Skips indented code blocks (4+ leading spaces, non-list lines).

` -- ` (space hyphen hyphen space) is left untouched: in this code/CLI repo it
is a legitimate end-of-options separator (`git ls-tree <rev> -- <path>`), not an
em-dash substitute. See rule_anti_slop.md "Em-dashes" (dev1 divergence from the
consultancy zero-double-hyphen rule).

Usage:
    uv run tools/strip-em-dash.py FILE [FILE ...]

Reports per-file count of replacements + any remaining em-dashes after.
"""
import sys
from pathlib import Path


def strip_em_dashes(path: Path) -> tuple[int, int]:
    """Return (replacements_made, remaining_em_dashes)."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    in_fence = False
    out: list[str] = []
    replacements = 0
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue
        # Skip indented code (4+ leading spaces, but not list items)
        if line.startswith("    ") and not stripped.startswith(("-", "*", "+")):
            out.append(line)
            continue
        # Replace ` — ` (spaced em-dash) with `; ` in prose. ` -- ` is left
        # intact on purpose (legitimate CLI end-of-options separator in this
        # repo); see the module docstring + rule_anti_slop.md "Em-dashes".
        em_count = line.count(" — ")
        new_line = line.replace(" — ", "; ")
        if new_line != line:
            replacements += em_count
        out.append(new_line)

    new_text = "".join(out)
    path.write_text(new_text, encoding="utf-8")

    # Count remaining em-dashes (these survived because they were inside code or
    # not surrounded by spaces).
    remaining = new_text.count("—")
    return replacements, remaining


def main() -> int:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} FILE [FILE ...]", file=sys.stderr)
        return 2

    total_replacements = 0
    total_remaining = 0
    for arg in sys.argv[1:]:
        path = Path(arg)
        if not path.is_file():
            print(f"SKIP (not a file): {path}", file=sys.stderr)
            continue
        rep, rem = strip_em_dashes(path)
        total_replacements += rep
        total_remaining += rem
        print(f"  {path}: replaced {rep}, remaining {rem}")

    print()
    print(f"Total: replaced {total_replacements}, {total_remaining} em-dashes remain (in code or non-prose context)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
