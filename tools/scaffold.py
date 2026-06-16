# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""scaffold.py: stamp a template archetype into products/<name>.

The spine of the catalyzer (docs/blueprint.md). Pre-decide everything decidable
once (stack, structure, quality floor) so a new product spends zero time on setup.
This composes two layers into a fresh product dir:

  templates/_shared/   archetype-agnostic skeletons (README, ARCHITECTURE,
                       PRODUCT brief, .gitignore), overlaid first;
  templates/<archetype>/   the stack (package.json with the dev1 manifest block,
                       configs, src, lockfile), overlaid second so it wins.

Tokens are substituted across stamped text files:
  {{PRODUCT_NAME}}            -> the slug (kebab-case dir / npm name)
  {{PRODUCT_TITLE}}           -> a human title (derived from the slug, or --title)
  {{ARCHETYPE}}               -> website | app | game
  dev1-template-<archetype>   -> the slug (the package.json/lockfile name
                                 placeholder; a valid npm name so the template
                                 installs in place for the CI build check)

  uv run tools/scaffold.py game my-game
  uv run tools/scaffold.py game my-game --title "My Game"
  uv run tools/scaffold.py app demo --dry-run

A new product is reversible (delete the dir), so this stays in the autonomous
band; it never touches an existing product.
"""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TEMPLATES = REPO / "templates"
PRODUCTS = REPO / "products"

ARCHETYPES = ("website", "app", "game")
SHARED = "_shared"

# Dirs never copied out of a template (build/install detritus, VCS).
SKIP_DIRS = {"node_modules", "dist", "build", ".git", "__pycache__"}

# A valid product slug: lowercase, starts alphanumeric, kebab-case. Tight on
# purpose; it becomes both a directory name and the npm package name.
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]*$")


class ScaffoldError(ValueError):
    """A caller/usage error (bad archetype, name, or collision). Fail-loud."""


def title_from_slug(slug: str) -> str:
    """my-cool-game -> My Cool Game."""
    return " ".join(word.capitalize() for word in slug.split("-") if word)


def substitutions(archetype: str, slug: str, title: str) -> dict[str, str]:
    return {
        f"dev1-template-{archetype}": slug,
        "{{PRODUCT_NAME}}": slug,
        "{{PRODUCT_TITLE}}": title,
        "{{ARCHETYPE}}": archetype,
    }


def apply_tokens(text: str, subs: dict[str, str]) -> str:
    for token, value in subs.items():
        text = text.replace(token, value)
    return text


def iter_template_files(root: Path):
    """Yield (source_file, path_relative_to_root) skipping SKIP_DIRS."""
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        if path.is_file():
            yield path, path.relative_to(root)


def stamp_file(src: Path, dest: Path, subs: dict[str, str]) -> None:
    """Copy one file, substituting tokens in text; binaries copied byte-for-byte."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        text = src.read_text(encoding="utf-8")
    except (UnicodeDecodeError, ValueError):
        shutil.copy2(src, dest)
        return
    dest.write_text(apply_tokens(text, subs), encoding="utf-8")


def plan_layers(archetype: str, templates_root: Path) -> list[Path]:
    """The template dirs overlaid in order: _shared first, archetype second."""
    shared = templates_root / SHARED
    arch = templates_root / archetype
    layers = []
    if shared.is_dir():
        layers.append(shared)
    layers.append(arch)
    return layers


def scaffold(
    archetype: str,
    name: str,
    *,
    products_root: Path = PRODUCTS,
    templates_root: Path = TEMPLATES,
    title: str | None = None,
    dry_run: bool = False,
) -> tuple[Path, list[str]]:
    """Stamp <archetype> into <products_root>/<name>. Returns (dest, relpaths).

    Raises ScaffoldError on a bad archetype, an invalid name, a not-yet-ready
    template (no package.json), or an existing destination.
    """
    if archetype not in ARCHETYPES:
        raise ScaffoldError(
            f"unknown archetype {archetype!r}; choose one of {', '.join(ARCHETYPES)}"
        )
    if not SLUG.match(name):
        raise ScaffoldError(
            f"invalid name {name!r}: use lowercase kebab-case (a-z, 0-9, -), "
            "starting alphanumeric"
        )

    arch_dir = templates_root / archetype
    if not (arch_dir / "package.json").is_file():
        raise ScaffoldError(
            f"the {archetype!r} template is a stub (no package.json yet); see "
            f"templates/{archetype}/README.md for what fills it"
        )

    dest = products_root / name
    if dest.exists():
        raise ScaffoldError(
            f"products/{name}/ already exists; scaffold never overwrites a product"
        )

    title = title or title_from_slug(name)
    # The title is the only user-supplied substitution value (name is SLUG-checked,
    # archetype is a fixed set). A title carrying a token would survive the single
    # substitution pass and leak a placeholder into a stamped file; refuse it so
    # "no placeholder survives" holds unconditionally.
    if "{{" in title or "dev1-template-" in title:
        raise ScaffoldError(
            f"invalid title {title!r}: must not contain a substitution token "
            "('{{...}}' or 'dev1-template-')"
        )
    subs = substitutions(archetype, name, title)

    # Collect the overlay: later layers (archetype) win on a path collision.
    files: dict[Path, Path] = {}
    for layer in plan_layers(archetype, templates_root):
        for src, rel in iter_template_files(layer):
            files[rel] = src

    written: list[str] = []
    for rel, src in sorted(files.items()):
        written.append(str(rel).replace("\\", "/"))
        if not dry_run:
            stamp_file(src, dest / rel, subs)

    return dest, written


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Stamp a template archetype into products/<name>.")
    ap.add_argument("archetype", choices=ARCHETYPES, help="website | app | game")
    ap.add_argument("name", help="product slug (lowercase kebab-case)")
    ap.add_argument("--title", help="human title for headings (default: derived from name)")
    ap.add_argument("--dry-run", action="store_true", help="list files, write nothing")
    args = ap.parse_args(argv)

    try:
        dest, written = scaffold(
            args.archetype, args.name, title=args.title, dry_run=args.dry_run
        )
    except ScaffoldError as exc:
        print(f"[scaffold] {exc}", file=sys.stderr)
        return 1

    rel_dest = dest.relative_to(REPO) if dest.is_relative_to(REPO) else dest
    head = "[scaffold] would create" if args.dry_run else "[scaffold] created"
    print(f"{head} {rel_dest}/ ({len(written)} files):")
    for path in written:
        print(f"  {path}")
    if not args.dry_run:
        print(
            f"\nNext: cd {rel_dest} && npm install && npm run dev\n"
            "Then fill PRODUCT.md (the brief) and ARCHITECTURE.md (the module map) "
            "before building."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
