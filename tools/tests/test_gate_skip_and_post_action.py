"""gate-skip-detector + post-action-gate: the Cycle-2 re-point.

Pins the dev1-native decouple of the two seeded PostToolUse(Bash) advisory
hooks:

  1. tools/verify.py is recognized as a validation / verification step, so a
     push after verify.py no longer false-fires the pre-publish advisory, and
     a verify.py re-run does not advance the iteration-3x streak. This is the
     2026-06-07 friction row ("seeded gates don't recognize tools/verify.py").
  2. The inert ops domain patterns are gone: gate-skip-detector dropped the
     Make/n8n MCP update-without-get block and the vercel publish patterns;
     post-action-gate dropped vercel from the ship set.

Function-level pins assert the pattern sets directly (deterministic, no I/O).
End-to-end tests exercise the hooks as subprocesses with an isolated temp dir
(the buffer / counter / session-state files all live under the OS temp dir, so
overriding TEMP/TMP/TMPDIR + AGENTIC_DEV1_SESSION_STATE keeps a test run from
touching the developer's live session state).
"""
from __future__ import annotations

import importlib.util
import re

from hooklib import HOOKS, run_hook


def _load(stem: str):
    path = HOOKS / f"{stem}.py"
    spec = importlib.util.spec_from_file_location(stem.replace("-", "_"), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


GSD = _load("gate-skip-detector")
PAG = _load("post-action-gate")


def _isolation_env(tmp_path):
    """Redirect every temp-dir-derived state file into tmp_path so the hook
    subprocess can't read or clobber the live session's buffer / counter /
    candidate store."""
    return {
        "TEMP": str(tmp_path),
        "TMP": str(tmp_path),
        "TMPDIR": str(tmp_path),
        "AGENTIC_DEV1_SESSION_STATE": str(tmp_path / "state.json"),
    }


def _matches(cmd: str, patterns) -> bool:
    return any(re.search(p, cmd) for p in patterns)


# --------------------------------------------------------------------------
# Function-level pins
# --------------------------------------------------------------------------
def test_gate_skip_recognizes_verify_py_as_validation():
    # Both the plain and the --directory invocation forms.
    assert _matches("uv run tools/verify.py crew", GSD.VALIDATE_PATTERNS)
    assert _matches(
        "uv run --directory C:/x/agentic-dev1 tools/verify.py all",
        GSD.VALIDATE_PATTERNS,
    )


def test_gate_skip_verify_py_is_readonly():
    # A verify.py re-run must not count toward the iteration-3x stuck-loop signal.
    assert GSD.is_readonly("uv run tools/verify.py harness")


def test_gate_skip_dropped_mcp_and_vercel_patterns():
    assert not hasattr(GSD, "MCP_UPDATE_PATTERNS")
    assert not any("vercel" in p for p in GSD.PUBLISH_PATTERNS)
    # The real dev1 publish verbs still match.
    assert _matches("git push origin HEAD", GSD.PUBLISH_PATTERNS)
    assert _matches("gh pr merge 8 -R 011matthias/agentic-dev1", GSD.PUBLISH_PATTERNS)


def test_post_action_recognizes_verify_py_as_build():
    assert _matches("uv run tools/verify.py", PAG.BUILD_TEST_PATTERNS)


def test_post_action_verify_py_exempt_from_streak():
    # Recognized as a verification command (B2 nudge) but exempt from the
    # 3-in-a-row HARD LIMIT count, like the other validators.
    assert PAG.is_exempt("uv run tools/verify.py all")


def test_post_action_dropped_vercel_from_ship():
    assert not any("vercel" in p for p in PAG.SHIP_PATTERNS)
    assert _matches("git push origin HEAD", PAG.SHIP_PATTERNS)


# --------------------------------------------------------------------------
# End-to-end: the friction we are closing
# --------------------------------------------------------------------------
def test_push_after_verify_does_not_false_fire_pre_publish(tmp_path):
    env = _isolation_env(tmp_path)
    # Seed the buffer with a verify.py run, then push.
    run_hook("gate-skip-detector.py",
             {"tool_name": "Bash",
              "tool_input": {"command": "uv run tools/verify.py all"}},
             env=env)
    p = run_hook("gate-skip-detector.py",
                 {"tool_name": "Bash",
                  "tool_input": {"command": "git push origin HEAD"}},
                 env=env)
    assert "GATE-SKIP: pre-publish" not in p.stdout


def test_push_without_validation_still_fires_pre_publish(tmp_path):
    # Control: a push with no validation in the buffer must still be flagged,
    # so the recognition change didn't blunt the gate.
    p = run_hook("gate-skip-detector.py",
                 {"tool_name": "Bash",
                  "tool_input": {"command": "git push origin HEAD"}},
                 env=_isolation_env(tmp_path))
    assert "GATE-SKIP: pre-publish" in p.stdout


def test_verify_reruns_never_hit_hard_limit(tmp_path):
    env = _isolation_env(tmp_path)
    outs = [
        run_hook("post-action-gate.py",
                 {"tool_name": "Bash",
                  "tool_input": {"command": "uv run tools/verify.py all"}},
                 env=env).stdout
        for _ in range(3)
    ]
    assert all("HARD LIMIT" not in o for o in outs), "verify.py re-runs tripped the cap"
    assert any("[B2]" in o for o in outs), "verify.py should still emit the B2 nudge"


def test_repeated_real_build_still_hits_hard_limit(tmp_path):
    # Control: a genuine non-exempt fix-then-test loop still escalates at 3.
    env = _isolation_env(tmp_path)
    outs = [
        run_hook("post-action-gate.py",
                 {"tool_name": "Bash",
                  "tool_input": {"command": "npm run build"}},
                 env=env).stdout
        for _ in range(3)
    ]
    assert "HARD LIMIT" in outs[-1], "a real 3x build loop should escalate"
