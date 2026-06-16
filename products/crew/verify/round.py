# /// script
# requires-python = ">=3.9"
# dependencies = ["playwright"]
# ///
"""round.py: CREW's behavioral verification bar (the skil_crew-verify recipe).

`tools/verify.py crew` is build-only until a product ships an npm `verify`
script; this is that script's payload. It proves, against the running build,
the invariants `rule_code_review` names for CREW but a passing `tsc`/`vite build`
says nothing about:

  - Confessions anonymity: the per-player yes/no vector never reaches the log;
    only the aggregate (yesCount, N) is persisted. This is the Cycle-4 anneal
    ("Confessions anonymity has no test") made executable.
  - No measurement double-fire: each standard event fires exactly once per its
    moment (the reason `main.tsx` has no StrictMode; a regression that re-enabled
    it would double round_start/reveal and blind phase-1 measurement).
  - Measurement schema: every event carries the documented shape.

Two tiers, so the bar stays runnable everywhere while the strong proof runs
where a browser exists:

  STATIC  source tripwires (no browser): StrictMode absent, press-squash is CSS,
          the three localStorage keys + the snapshot `v`, the event vocabulary.
          A rename that breaks aggregation trips here cheaply, always.
  RUNTIME a real headless Confessions round driven with Playwright, reading the
          persisted `crew_logs_v1` and asserting anonymity / no-double-fire /
          schema from what the build ACTUALLY logged. Needs chromium; if the
          browser (or playwright) is absent the runtime tier SKIPs loudly and
          the static tier still gates, so verify.py stays portable.

The runtime tier uses the webapp-testing approach (headless chromium, drive the
real DOM); it launches its own dev server inline rather than via that skill's
with_server.py CLI, so the npm `verify` one-liner needs no nested-quote shell
gymnastics on Windows and the product carries no dependency on the skill tree's
layout. Confessions is driven because it is the anonymity-bearing mode and the
anneal target; the static tier covers the cross-mode key/version tripwires.

  cd products/crew && npm run verify        # build + this (verify.py crew path)
  uv run --no-project --with playwright python verify/round.py   # this alone
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

PRODUCT_ROOT = Path(__file__).resolve().parent.parent
SRC = PRODUCT_ROOT / "src"
NPM = "npm.cmd" if os.name == "nt" else "npm"

# A dedicated, uncommon port with strictPort so the round drives a known URL. A
# stale dev server on it makes vite exit immediately; we detect that and fail
# clearly rather than silently driving the wrong app.
PORT = 5183
BASE_URL = f"http://localhost:{PORT}"

# The only keys a Confessions `reveal` event may carry. Anything outside this set
# is treated as a potential anonymity leak (the per-player vector would surface
# as an extra key / a boolean array). `closest` is winner indices, not answers.
ALLOWED_REVEAL_KEYS = {
    "t", "rel", "type", "mode",
    "promptId", "yesCount", "N", "yesRate", "guessError", "closest",
}
# Names a leaked per-player answer vector would plausibly travel under.
DENY_VECTOR_KEYS = {"answers", "yeses", "yesNo", "votes", "vector", "perPlayer", "responses", "raw"}


# --------------------------------------------------------------------------
# STATIC tier: source tripwires. Cheap, browser-free, always enforced.
# --------------------------------------------------------------------------

def _read(rel: str) -> str:
    return (SRC / rel).read_text(encoding="utf-8")


def static_checks() -> list[str]:
    """Return failure strings for the statically-checkable invariants."""
    fails: list[str] = []

    # No StrictMode: check the JSX element, not the word (main.tsx's comment
    # explains its deliberate absence and would false-positive a bare-word grep).
    main = _read("main.tsx")
    if "<StrictMode" in main or "React.StrictMode" in main:
        fails.append("main.tsx renders StrictMode (would double-fire dev effects + measurement)")

    # Press-squash must stay pure CSS so a React re-render cannot strip it. Two
    # halves: the CSS press-squash exists (:active + a scale-down), AND the button
    # juice hook does not re-introduce it as an imperative class (the regression
    # the gotcha guards against). Checking only the CSS would miss a JS-class move.
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    if ":active" not in css or "scale(0.9" not in css:
        fails.append("styles.css missing the :active scale-down press-squash (must stay pure CSS)")
    kernel = _read("kernel.tsx")
    start = kernel.find("export function useButtonJuice")
    juice = kernel[start:kernel.find("export function", start + 1)] if start != -1 else ""
    if "classList" in juice or ".className" in juice:
        fails.append("useButtonJuice mutates a button class (press-squash must stay CSS, not a JS class)")

    # The three versioned localStorage keys + the Impostor snapshot version. A
    # rename without a migration breaks resume/stats for returning players.
    for key, where in (("crew_roster_v1", "App.tsx"),
                       ("crew_logs_v1", "measure.ts"),
                       ("crew_game_v1", "modes/Impostor.tsx")):
        if key not in _read(where):
            fails.append(f"localStorage key '{key}' not found in {where} (renamed without migration?)")
    if "v: 1" not in _read("modes/Impostor.tsx"):
        fails.append("Impostor snapshot version `v: 1` missing (bump + migrate on a shape change)")

    # The standard event vocabulary: renaming any silently breaks aggregation,
    # the export schema, and the future remote schema (measure.ts blast radius).
    blob = _read("measure.ts") + _read("modes/Confessions.tsx")
    for ev in ("session_start", "round_start", "reveal", "banger", "next_round", "session_end"):
        if f"'{ev}'" not in blob and f'"{ev}"' not in blob:
            fails.append(f"measurement event '{ev}' not emitted anywhere (renamed?)")

    return fails


# --------------------------------------------------------------------------
# RUNTIME tier: drive a real Confessions round, assert from the logged events.
# --------------------------------------------------------------------------

def start_dev_server() -> subprocess.Popen:
    """Launch vite dev on PORT and wait until it answers; raise on failure.

    Dev (not preview) is deliberate: StrictMode's double-invoke is a dev-only
    behavior, so the dev server is the correct env to prove it does NOT happen.
    """
    proc = subprocess.Popen(
        [NPM, "run", "dev", "--", "--port", str(PORT), "--strictPort"],
        cwd=str(PRODUCT_ROOT),
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if proc.poll() is not None:  # vite exited (port busy / build error)
            out = proc.stdout.read() if proc.stdout else ""
            raise RuntimeError(f"dev server exited early (port {PORT} busy?):\n{out}")
        try:
            with urllib.request.urlopen(BASE_URL, timeout=2):
                return proc
        except Exception:
            time.sleep(0.5)
    stop_dev_server(proc)
    raise RuntimeError(f"dev server did not come up on {BASE_URL} within 60s")


def stop_dev_server(proc: subprocess.Popen) -> None:
    """Kill the dev server and its child node tree (best effort, never raises)."""
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                           capture_output=True)
        else:
            proc.terminate()
        proc.wait(timeout=10)
    except Exception:
        pass


def drive_confessions_round(page, rounds: int = 2) -> None:
    """Play `rounds` full Confessions rounds: quick crew of 5, guess, answer,
    reveal; tap the banger and Next round between rounds, End game at the end."""
    page.goto(BASE_URL)
    page.wait_for_selector(".mode-card", timeout=15000)

    page.locator(".mode-card", has_text="Confessions").click()
    page.get_by_role("button", name="Quick crew of 5").click()
    page.get_by_role("button", name="Start", exact=True).click()

    n = 5
    for r in range(rounds):
        # guess phase: each player holds to reveal, then locks the default guess.
        for _ in range(n):
            _hold_reveal(page)
            page.get_by_role("button", name="Lock and pass").click()
        # answer phase: each player holds to reveal, then answers. Alternating so
        # the aggregate yesCount lands strictly between 0 and N.
        for i in range(n):
            _hold_reveal(page)
            side = ".opt-btn.side-yes" if i % 2 == 0 else ".opt-btn.side-no"
            page.locator(side).click()
        # reveal: confirm the count screen rendered.
        page.wait_for_selector(".count-reveal", timeout=10000)
        if r == 0:
            page.locator(".btn-banger").click()
            page.get_by_role("button", name="Next round").click()
        else:
            page.get_by_role("button", name="End game").click()

    page.wait_for_selector("text=Session data", timeout=10000)


def _hold_reveal(page) -> None:
    """Trigger HoldToReveal. Enter on the focused button reveals at once (the
    kernel's keyboard path), avoiding a flaky 500ms timed mouse-hold."""
    page.wait_for_selector(".hold-btn", timeout=10000)
    page.locator(".hold-btn").press("Enter")


def read_storage(page) -> dict:
    """Snapshot the three CREW localStorage keys after the round."""
    return page.evaluate(
        "() => ({"
        " logs: localStorage.getItem('crew_logs_v1'),"
        " roster: localStorage.getItem('crew_roster_v1'),"
        " game: localStorage.getItem('crew_game_v1') })"
    )


def _has_bool_array(value) -> bool:
    """A leaked per-player yes/no vector would be an array of booleans somewhere
    in an event. Scan recursively; `closest` (indices) is ints, so it is safe."""
    if isinstance(value, list):
        if value and all(isinstance(x, bool) for x in value):
            return True
        return any(_has_bool_array(x) for x in value)
    if isinstance(value, dict):
        return any(_has_bool_array(v) for v in value.values())
    return False


def check_logs(storage: dict, rounds: int = 2) -> list[str]:
    """Assert anonymity, no-double-fire, and schema from the persisted events."""
    fails: list[str] = []

    if not storage.get("logs"):
        return ["crew_logs_v1 was not written (the round logged nothing)"]
    if storage.get("game"):
        fails.append("crew_game_v1 present after a Confessions round (Impostor-only key leaked)")
    try:
        roster = json.loads(storage["roster"] or "{}")
        if len(roster.get("players", [])) != 5:
            fails.append(f"crew_roster_v1 did not persist 5 players: {roster.get('players')}")
    except (json.JSONDecodeError, TypeError):
        fails.append("crew_roster_v1 is not valid JSON")

    sessions = json.loads(storage["logs"])
    if len(sessions) != 1:
        fails.append(f"expected 1 logged session, found {len(sessions)} (stranded events?)")
    events = next(iter(sessions.values()), [])

    # No double-fire: exact counts for a `rounds`-round game. StrictMode (or a
    # re-armed effect) would inflate round_start / reveal.
    counts = {}
    for e in events:
        counts[e.get("type")] = counts.get(e.get("type"), 0) + 1
    expected = {
        "session_start": 1, "round_start": rounds, "reveal": rounds,
        "next_round": rounds - 1, "banger": 1, "session_end": 1,
    }
    for ev, want in expected.items():
        got = counts.get(ev, 0)
        if got != want:
            fails.append(f"event '{ev}' fired {got}x, expected {want}x (double-fire / miss)")

    # Schema: every event carries the documented shape.
    for e in events:
        if not isinstance(e.get("t"), (int, float)):
            fails.append(f"event missing numeric t: {e}")
        if not isinstance(e.get("rel"), (int, float)) or e.get("rel", -1) < 0:
            fails.append(f"event has bad rel: {e}")
        if not isinstance(e.get("type"), str):
            fails.append(f"event missing string type: {e}")
        if e.get("mode") != "confessions":
            fails.append(f"event not tagged mode=confessions: {e}")
        if e.get("type") == "next_round" and not isinstance(e.get("timeToNextRoundMs"), (int, float)):
            fails.append(f"next_round missing numeric timeToNextRoundMs: {e}")

    # Anonymity: the reveal carries only the aggregate; nothing maps an answer to
    # a person. This is the core anneal-closing assertion.
    for e in events:
        if any(k in e for k in DENY_VECTOR_KEYS):
            fails.append(f"event carries a per-player-vector-shaped key: {sorted(e)}")
        if _has_bool_array(e):
            fails.append(f"event carries a boolean array (per-player yes/no vector leaked): {e}")
        if e.get("type") == "reveal":
            extra = set(e) - ALLOWED_REVEAL_KEYS
            if extra:
                fails.append(f"reveal carries unexpected key(s) {sorted(extra)} (possible leak)")
            if not isinstance(e.get("yesCount"), int) or not isinstance(e.get("N"), int):
                fails.append(f"reveal aggregate yesCount/N not ints: {e}")
            elif not (0 <= e["yesCount"] <= e["N"]):
                fails.append(f"reveal yesCount out of range 0..N: {e}")

    return fails


def runtime_checks() -> tuple[str, list[str]]:
    """Drive the round. Returns (status, failures) where status is 'ran',
    'skip' (browser/playwright absent), or 'error' (the round itself broke)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return "skip", ["playwright not installed (uv run --with playwright ...)"]

    server = None
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(headless=True)
            except Exception as exc:  # browser binary not installed
                if "Executable doesn't exist" in str(exc) or "playwright install" in str(exc):
                    return "skip", ["chromium not installed (run: playwright install chromium)"]
                raise
            try:
                server = start_dev_server()
                page = browser.new_page()
                drive_confessions_round(page, rounds=2)
                storage = read_storage(page)
            finally:
                browser.close()
        return "ran", check_logs(storage, rounds=2)
    except Exception as exc:
        # A failure AFTER a successful launch means the app changed or broke; that
        # is a real FAIL, never a silent skip.
        return "error", [f"the round itself failed: {type(exc).__name__}: {exc}"]
    finally:
        if server is not None:
            stop_dev_server(server)


def main() -> int:
    static_fails = static_checks()
    status, runtime_fails = runtime_checks()

    print("=== crew-verify: static invariant tripwires ===")
    if static_fails:
        for f in static_fails:
            print(f"  [FAIL] {f}")
    else:
        print("  [PASS] StrictMode absent, press-squash CSS, keys+v, event vocabulary")

    print(f"=== crew-verify: runtime Confessions round ({status}) ===")
    if status == "skip":
        print(f"  [SKIP] {runtime_fails[0]} -- static tier still enforced; "
              "the anonymity/double-fire proof needs a browser.")
        runtime_fails = []  # a skip does not fail the bar
    elif runtime_fails:
        for f in runtime_fails:
            print(f"  [FAIL] {f}")
    else:
        print("  [PASS] anonymity (no per-player vector logged), no double-fire, schema OK")

    ok = not static_fails and not runtime_fails
    print(f"=== {'PASS' if ok else 'FAIL'}: crew-verify ===")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
