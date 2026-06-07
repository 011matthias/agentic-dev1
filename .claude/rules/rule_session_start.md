# Session Start

When a session begins:

1. **Load all memory.** Read every file in `memory/` (the committed knowledge
   base) plus `MEMORY.md` as the index. With a large context window this is cheap
   and prevents re-deriving solved problems.
2. **Print the session header** as the first block (format below).
3. **Name the band.** State whether the work is autonomous or sits at the floor
   (see `rule_operating`).
4. **Check open threads.** Read the latest checkpoint in `docs/sessions/` and
   `docs/friction-register.md` for next-steps and unresolved patterns; run
   `tools/friction-watch.py` for push signals.
5. **Activate the operating model:** lean-autonomous, floor-gated, plus the
   carried reflexes in `rule_operating`.

## Session header

Print this as the first block of the session:

```
---
**[dev1] {task}**
Scope: {product or harness} | Band: {autonomous | floor-pending}
State: {N open PR(s)} | Friction: {N open or "clear"}
Memory: {memory files loaded by name}
---
```

## Close

At a natural breakpoint or session end, run `/comd_checkpoint`: save state to
`docs/sessions/`, log any friction, leave a next-steps line. `/comd_resume`
reloads that on the next session. At high context pressure, checkpoint before
continuing rather than risking work loss to compaction.
