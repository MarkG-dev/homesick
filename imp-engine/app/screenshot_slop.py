#!/usr/bin/env python3
"""Serve + screenshot the Slop Score page with a high-slop sample scored."""
import sys, threading, time, urllib.request
from pathlib import Path
APP = Path(__file__).resolve().parent
sys.path.insert(0, str(APP))
import server  # noqa

PORT = 5066
threading.Thread(target=lambda: server.app.run(port=PORT, use_reloader=False), daemon=True).start()
for _ in range(50):
    try:
        urllib.request.urlopen(f"http://localhost:{PORT}/slop", timeout=1); break
    except Exception:
        time.sleep(0.2)

from playwright.sync_api import sync_playwright  # noqa
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
SLOP = ("I'm thrilled to share that I'm embarking on an exciting new chapter! After an incredible "
        "journey, I'm passionate about leveraging cutting-edge solutions to unlock our full "
        "potential and drive impact. In today's fast-paced landscape, it's not just about working "
        "harder, but working smarter. Can't wait to dive in. Onward and upward!")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1000, "height": 1100}, device_scale_factor=2)
    pg.goto(f"http://localhost:{PORT}/slop", wait_until="networkidle")
    pg.fill("#text", SLOP)
    pg.click("#run")
    pg.wait_for_selector("#result:not(.hidden)", timeout=15000)
    pg.wait_for_timeout(400)
    out = APP / "slop_score_screenshot.png"
    pg.screenshot(path=str(out), full_page=True)
    print("saved", out)
    b.close()
