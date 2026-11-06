#!/usr/bin/env python3
"""Morning message from your own Telegram bot.

  telegram.py setup                     once, in a terminal: asks for the bot token (hidden), then
                                        waits until you send /start to the bot and saves your chat id
  telegram.py send "text" [--url URL]   sends text, with an "Open BitFeed" button when --url is given

The token and chat id live only in ~/.bitfeed/telegram.json (mode 600), never in the repo.
"""
import argparse
import getpass
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CONFIG = Path.home() / ".bitfeed" / "telegram.json"
API = "https://api.telegram.org/bot{token}/{method}"


def call(token: str, method: str, payload: dict | None = None) -> dict:
    data = json.dumps(payload or {}).encode()
    req = urllib.request.Request(API.format(token=token, method=method), data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.load(resp)
    if not body.get("ok"):
        raise RuntimeError(f"Telegram {method} failed: {body.get('description')}")
    return body["result"]


def setup() -> int:
    token = getpass.getpass("Bot token from @BotFather (input is hidden): ").strip()
    me = call(token, "getMe")
    print(f"Bot found: @{me['username']}. Now open Telegram and send /start to @{me['username']}.")
    print("Waiting up to 3 minutes…")
    offset, deadline = None, time.time() + 180
    while time.time() < deadline:
        updates = call(token, "getUpdates", {"timeout": 20, **({"offset": offset} if offset else {})})
        for u in updates:
            offset = u["update_id"] + 1
            msg = u.get("message") or {}
            if msg.get("text", "").startswith("/start"):
                chat_id = msg["chat"]["id"]
                CONFIG.parent.mkdir(mode=0o700, exist_ok=True)
                CONFIG.write_text(json.dumps({"token": token, "chat_id": chat_id}))
                CONFIG.chmod(0o600)
                call(token, "sendMessage", {"chat_id": chat_id,
                                            "text": "BitFeed is connected. Your cards will come here every morning."})
                print(f"Saved to {CONFIG}. A test message was sent.")
                return 0
    print("No /start received. Run setup again.")
    return 1


def send(text: str, url: str | None) -> int:
    if not CONFIG.exists():
        print(f"No {CONFIG}: run 'telegram.py setup' first. Skipping the message.")
        return 0  # not an error for the daily task
    cfg = json.loads(CONFIG.read_text())
    payload = {"chat_id": cfg["chat_id"], "text": text, "disable_web_page_preview": True}
    if url:
        payload["reply_markup"] = {"inline_keyboard": [[{"text": "Open BitFeed →", "url": url}]]}
    call(cfg["token"], "sendMessage", payload)
    print("sent")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("setup")
    s = sub.add_parser("send")
    s.add_argument("text")
    s.add_argument("--url")
    args = ap.parse_args()
    return setup() if args.cmd == "setup" else send(args.text, args.url)


if __name__ == "__main__":
    sys.exit(main())
