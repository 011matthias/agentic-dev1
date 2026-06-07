---
name: gotcha_windows_git_read
description: Git-Bash on this machine mangles `git show <rev>:<path>`; use git ls-tree / cat-file -p instead.
metadata:
  type: reference
---

Git-Bash on this Windows machine mangles `git show <rev>:<path>` and
`git cat-file -e <rev>:<path>`: the `<rev>:<path>` argument gets rewritten
(`origin/main:...` becomes `origin\main;...`) and produces silent empty output,
especially under `2>/dev/null`. This produced a false "main is missing files" alarm
in the agentic-ops session that preceded this repo.

Use `git ls-tree <rev> -- <path>` to check existence and `git cat-file -p <blob-sha>`
to read a blob. Those do not mangle. The `cd-guard` hook covers the other recurring
Windows-shell friction (`cd X && ...` persisting shell cwd across hook runs).
