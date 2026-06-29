#!/usr/bin/env python3
"""Serve the app in a thread, drive Chromium, screenshot the populated UI + a live rewrite."""
import sys, threading, time, urllib.request
from pathlib import Path

APP = Path(__file__).resolve().parent
sys.path.insert(0, str(APP))
import server  # noqa: E402

PORT = 5055
threading.Thread(target=lambda: server.app.run(port=PORT, use_reloader=False),
                 daemon=True).start()
for _ in range(50):
    try:
        urllib.request.urlopen(f"http://localhost:{PORT}/api/voices", timeout=1); break
    except Exception:
        time.sleep(0.2)

from playwright.sync_api import sync_playwright  # noqa: E402

CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
DRAFT = ("I'm excited to share that after five great years at Northwind, I'm joining "
         "Lumen as their new Head of Product. Grateful to everyone who supported me. "
         "Looking forward to this next chapter!")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1180, "height": 1700}, device_scale_factor=2)
    pg.goto(f"http://localhost:{PORT}/", wait_until="networkidle")
    # select the pre-built voice
    pg.select_option("#voicelist", index=1)
    pg.wait_for_selector("#rewritepanel:not(.hidden)", timeout=10000)
    pg.fill("#ctype", "LinkedIn post")
    pg.fill("#draft", DRAFT)
    pg.eval_on_selector("#tone", "el => { el.value = 80; el.dispatchEvent(new Event('input')); }")
    pg.click("#run")
    pg.wait_for_selector("#result:not(.hidden)", timeout=60000)
    pg.wait_for_timeout(600)
    out = APP / "voice_filter_screenshot.png"
    pg.screenshot(path=str(out), full_page=True)
    print("saved", out)
    b.close()
