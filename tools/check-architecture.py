# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""check-architecture.py: the understand-before-change structural gate.

rule_dev_loop non-negotiable 1 (understand before you change) says: read the
subsystem and its ARCHITECTURE notes before touching it. A map only earns that
trust if it stays true to the tree, so this turns the map into a CI-gated
contract:

  1. Existence  -- every products/<name>/ carries ARCHITECTURE.md and README.md.
  2. Freshness  -- every concrete product-relative path the ARCHITECTURE map
     names in backticks (src/..., public/..., tests/...) exists on disk. A
     rename that updates code but not the map is caught here, so the map cannot
     silently rot into a lie an editor would trust.

Globs (`src/modes/*.tsx`) and templates (`modes/<Name>.tsx`) are skipped on
purpose: they are intentionally non-literal. Only concrete product-rooted paths
with a real extension are validated, which is exactly the module map and never
prose, identifiers, or cross-repo references.

Exit 0 when every product passes; exit 1 with the findings otherwise.
Run: uv run tools/check-architecture.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PRODUCTS = REPO / "products"

REQUIRED = ("ARCHITECTURE.md", "README.md")

# A backticked token is a concrete product file reference worth validating when
# it is rooted at a product source dir (src/ public/ tests/) and ends in an
# extension. Tight by design: catches the module map, never prose.
PATH_TOKEN = re.compile(r"`(?P<p>(?:src|public|tests)/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)`")
NONLITERAL = ("*", "<", ">", "|", " ")


def referenced_paths(arch_text: str) -> list[str]:
    """Concrete product-relative file paths named in backticks, in order, deduped."""
    out: list[str] = []
    seen: set[str] = set()
    for m in PATH_TOKEN.finditer(arch_text):
        tok = m.group("p")
        if any(c in tok for c in NONLITERAL) or tok in seen:
            continue
        seen.add(tok)
        out.append(tok)
    return out


def check_product(root: Path) -> list[str]:
    """Return the list of findings for one product dir; empty means it passes."""
    findings: list[str] = []
    for req in REQUIRED:
        if not (root / req).is_file():
            findings.append(f"missing {req}")
    arch = root / "ARCHITECTURE.md"
    if arch.is_file():
        for rel in referenced_paths(arch.read_text(encoding="utf-8")):
            if not (root / rel).exists():
                findings.append(f"ARCHITECTURE.md names `{rel}` which does not exist")
    return findings


def discover_products() -> list[Path]:
    if not PRODUCTS.is_dir():
        return []
    return sorted(
        p for p in PRODUCTS.iterdir() if p.is_dir() and not p.name.startswith(".")
    )


def main() -> int:
    products = discover_products()
    if not products:
        print("[check-architecture] no products under products/; nothing to check")
        return 0
    failed: dict[str, list[str]] = {}
    for root in products:
        findings = check_product(root)
        if findings:
            failed[root.name] = findings
    if failed:
        print("[check-architecture] understand-before-change gate FAILED:", file=sys.stderr)
        for name, findings in failed.items():
            for finding in findings:
                print(f"  - {name}: {finding}", file=sys.stderr)
        print(
            "\nrule_dev_loop non-negotiable 1: the ARCHITECTURE map is the "
            "understand-before-change\ncontract; keep it true to the tree "
            "(update the map in the same change as the code).",
            file=sys.stderr,
        )
        return 1
    print(f"[check-architecture] OK: {len(products)} product(s) carry an accurate ARCHITECTURE map")
    return 0


if __name__ == "__main__":
    sys.exit(main())
