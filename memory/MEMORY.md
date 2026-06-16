# Memory Index

Committed project knowledge for agentic-dev1. One line per memory; the file it points
to holds the full fact. Add a pointer when you add a memory file.

- [CREW game; concept + build state](project_crew_game.md); single-device pass-and-play party game; first product, now lives in products/crew/.
- [Windows git-read mangling](gotcha_windows_git_read.md); use git ls-tree / cat-file -p, not git show <rev>:<path>.
- [Cross-repo cwd: never cd into dev1 from an ops-rooted session](gotcha_cross_repo_cwd.md); drive by git -C / gh -R / uv run --directory / absolute paths. cd-guard catches `&&`, `;`, `|`, `&` chains (widened 2026-06-16).
- [Shared worktree: two sessions in one checkout share HEAD](gotcha_shared_worktree.md); a parallel branch switch stomps your commit; recover via push-by-SHA then guarded disentangle; structural fix is git worktree.
