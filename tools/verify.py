# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""verify.py: the single behavioral-verification command for agentic-dev1.

"Done" requires executed proof, not "it compiled". This runs the verification
bar for a scope and prints a PASS/FAIL report you cite when claiming a unit of
work complete. See .claude/rules/rule_dev_loop.md (non-negotiable 2: verify
behavior, not state).

Scopes:
  harness        ruff real-bug ruleset + tools/INDEX.md gate + the pytest suite
  <product>      that product's recipe: products/<name> npm "verify" script if
                 present, else "build"
  all (default)  harness + every product under products/

Products self-register by having a build/verify npm script; there is no central
list to keep in sync. Exit 0 only when every step passes.

  uv run tools/verify.py            # all
  uv run tools/verify.py harness
  uv run tools/verify.py crew
  uv run tools/verify.py --json
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PRODUCTS = REPO / "products"
NPM = "npm.cmd" if os.name == "nt" else "npm"


def run_step(label: str, argv: list[str], cwd: Path) -> dict:
    """Run one verification step; return pass/fail plus a short output tail."""
    start = time.monotonic()
    try:
        proc = subprocess.run(
            argv, cwd=str(cwd),
            capture_output=True, text=True, encoding="utf-8", errors="replace",
        )
        ok = proc.returncode == 0
        out = (proc.stdout or "") + (proc.stderr or "")
    except (OSError, ValueError) as exc:
        ok, out = False, f"could not run {argv!r}: {exc}"
    tail = "\n".join(out.strip().splitlines()[-12:])
    return {"label": label, "ok": ok, "seconds": round(time.monotonic() - start, 1), "tail": tail}


def harness_steps() -> list[tuple[str, list[str]]]:
    return [
        ("harness: ruff", ["uv", "run", "--no-project", "--with", "ruff",
                           "ruff", "check", "tools", ".claude/hooks", "tools/tests"]),
        ("harness: INDEX gate", ["uv", "run", "tools/check-index.py"]),
        ("harness: ARCHITECTURE gate", ["uv", "run", "tools/check-architecture.py"]),
        ("harness: pytest", ["uv", "run", "--no-project", "--with", "pytest",
                            "pytest", "tools/tests"]),
    ]


def product_steps(name: str) -> tuple[list[tuple[str, list[str]]], Path]:
    root = PRODUCTS / name
    try:
        pkg = json.loads((root / "package.json").read_text(encoding="utf-8")) or {}
        scripts = pkg.get("scripts", {})
    except (json.JSONDecodeError, OSError):
        scripts = {}
    script = "verify" if "verify" in scripts else "build"
    steps: list[tuple[str, list[str]]] = []
    if not (root / "node_modules").is_dir():
        steps.append((f"product:{name} npm ci", [NPM, "ci"]))
    steps.append((f"product:{name} npm run {script}", [NPM, "run", script]))
    return steps, root


def discover_products() -> list[str]:
    if not PRODUCTS.is_dir():
        return []
    return sorted(p.name for p in PRODUCTS.iterdir() if (p / "package.json").is_file())


def main() -> int:
    ap = argparse.ArgumentParser(description="Behavioral verification bar for agentic-dev1.")
    ap.add_argument("scope", nargs="?", default="all",
                    help="all (default) | harness | <product name>")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    known = discover_products()
    scope = args.scope
    if scope not in ("all", "harness") and scope not in known:
        print(f"[verify] no product 'products/{scope}/' with a package.json. "
              f"Known products: {known or '(none)'}", file=sys.stderr)
        return 1

    plan: list[tuple[str, list[str], Path]] = []
    if scope in ("all", "harness"):
        plan += [(lbl, argv, REPO) for lbl, argv in harness_steps()]
    targets = known if scope == "all" else ([] if scope == "harness" else [scope])
    for name in targets:
        steps, root = product_steps(name)
        plan += [(lbl, argv, root) for lbl, argv in steps]

    if not plan:
        print(f"[verify] nothing to run for scope '{scope}'", file=sys.stderr)
        return 1

    results = [run_step(lbl, argv, cwd) for (lbl, argv, cwd) in plan]
    all_ok = all(r["ok"] for r in results)

    if args.json:
        print(json.dumps({"scope": scope, "ok": all_ok, "steps": results}, indent=2))
        return 0 if all_ok else 1

    print(f"=== verify: {scope} ===")
    for r in results:
        print(f"  [{'PASS' if r['ok'] else 'FAIL'}] {r['label']}  ({r['seconds']}s)")
        if not r["ok"]:
            for line in r["tail"].splitlines():
                print(f"        | {line}")
    passed = sum(1 for r in results if r["ok"])
    print(f"=== {'PASS' if all_ok else 'FAIL'}: {passed}/{len(results)} steps ===")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
