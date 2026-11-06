#!/usr/bin/env python3
"""Short digest of recent learning conversations, as input for personal BitFeed cards.

Reads Claude Code transcripts (~/.claude/projects/*/*.jsonl) of the learning projects, keeps only
the user's own text and the assistant's text replies (no tool calls, no tool output, no system
text), and writes a small Markdown digest. The digest and the state file stay in ~/.bitfeed/,
outside the git repo: conversations are never committed.

  learning_digest.py              messages since the last committed run (first run: last 7 days)
  learning_digest.py --days 14    messages from the last 14 days
  learning_digest.py --commit     after cards were made: remember "now" as the last run
"""
import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

PROJECTS = Path.home() / ".claude" / "projects"
OUT_DIR = Path.home() / ".bitfeed"
DIGEST = OUT_DIR / "digest.md"
STATE = OUT_DIR / "digest-state.json"

# Folders where the learning happens. The shared projects folder mixes many topics, so a session
# there must show the learning in the user's own words: at least MIN_HITS different learning terms
# (one is enough in the embedded folders). Sessions that build BitFeed itself or other apps are skipped.
LEARNING_DIRS = re.compile(r"-embedded")
MIXED_DIR = "-Users-vitaliiantoniuk-Documents-projects"
LEARNING_WORDS = re.compile(
    r"tinkercad|arduino|breadboard|resistor|transistor|multimeter|capacitor|\bled\b|ldr|tmp36|servo|"
    r"74hc|7805|stm32|rp2350|esp32|gpio|uart|i2c|\bspi\b|interrupt|timer|\badc\b|pwm|debounce|"
    r"datasheet|register|oscilloscope|volatile|bare.metal|millis|резистор|напруг|схем|струм",
    re.I,
)
MIN_HITS = 3
EXCLUDE_WORDS = re.compile(r"bitfeed|devfeed|hometown|gezellig|halo.of.ash|claude-agent-sdk|disk space", re.I)

MAX_USER = 600
MAX_ASSISTANT = 900
MAX_TOTAL = 30_000
# every session gets its share, so one long session cannot fill the whole digest
MIN_PER_SESSION = 3_000

TAG_BLOCK = re.compile(r"<(system-reminder|command-[\w-]+|local-command-[\w-]+|pasted_content[^>]*)>.*?</\1[^>]*>", re.S)


def clean(text: str) -> str:
    text = TAG_BLOCK.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def short(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def text_of(content) -> tuple[str, bool]:
    """Plain text of a message and whether it had an image (a screenshot)."""
    if isinstance(content, str):
        return content, False
    parts, image = [], False
    for block in content or []:
        if block.get("type") == "text":
            parts.append(block.get("text", ""))
        elif block.get("type") == "image":
            image = True
    return "\n".join(parts), image


def read_session(path: Path, since: datetime):
    title, messages, user_text = None, [], []
    for line in path.open(encoding="utf-8", errors="replace"):
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        kind = rec.get("type")
        if kind == "ai-title":
            title = rec.get("title") or rec.get("aiTitle") or title
            continue
        if kind not in ("user", "assistant") or rec.get("isMeta") or rec.get("isSidechain"):
            continue
        ts = rec.get("timestamp")
        try:
            when = datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None
        except ValueError:
            when = None
        if when is None or when < since:
            continue
        text, image = text_of((rec.get("message") or {}).get("content"))
        text = clean(text)
        if kind == "user":
            if not text and not image:
                continue  # tool results
            user_text.append(text)
            body = short(text, MAX_USER) + (" [screenshot]" if image else "")
            messages.append((when, "Me", body))
        elif text:
            messages.append((when, "Claude", short(text, MAX_ASSISTANT)))
    return title, messages, " ".join(user_text)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int)
    ap.add_argument("--commit", action="store_true")
    args = ap.parse_args()
    OUT_DIR.mkdir(mode=0o700, exist_ok=True)
    now = datetime.now(timezone.utc)

    if args.commit:
        STATE.write_text(json.dumps({"last_run": now.isoformat()}))
        print(f"state saved: next digest starts at {now:%Y-%m-%d %H:%M} UTC")
        return 0

    if args.days:
        since = now - timedelta(days=args.days)
    elif STATE.exists():
        since = datetime.fromisoformat(json.loads(STATE.read_text())["last_run"])
    else:
        since = now - timedelta(days=7)

    sessions = []
    for folder in PROJECTS.iterdir():
        if not folder.is_dir():
            continue
        learning_dir = bool(LEARNING_DIRS.search(folder.name))
        if not learning_dir and folder.name != MIXED_DIR:
            continue
        for path in folder.glob("*.jsonl"):
            if datetime.fromtimestamp(path.stat().st_mtime, timezone.utc) < since:
                continue
            title, messages, user_text = read_session(path, since)
            if not messages:
                continue
            hits = {m.lower() for m in LEARNING_WORDS.findall(user_text)}
            if len(hits) < (1 if learning_dir else MIN_HITS) or EXCLUDE_WORDS.search(user_text):
                continue
            project = folder.name.replace("-Users-vitaliiantoniuk-Documents-projects", "projects") or "projects"
            first_question = next((b for _, who, b in messages if who == "Me"), path.stem[:8])
            sessions.append((messages[-1][0], project, title or short(first_question.replace("\n", " "), 70), messages))

    sessions.sort(key=lambda s: s[0], reverse=True)  # newest first, so the cap cuts the oldest
    out = [f"# Learning digest since {since:%Y-%m-%d %H:%M} UTC\n"]
    total = len(out[0])
    per_session = max(MIN_PER_SESSION, MAX_TOTAL // max(1, len(sessions)))
    for last, project, title, messages in sessions:
        if total >= MAX_TOTAL:
            break
        head = f"\n## {title} ({project}, last {last:%Y-%m-%d})\n"
        # keep the newest messages of the session that fit its share
        lines, size = [], len(head)
        for _, who, body in reversed(messages):
            line = f"- **{who}:** {body}\n"
            if size + len(line) > per_session:
                lines.append("- …(older messages of this session cut)\n")
                break
            lines.append(line)
            size += len(line)
        block = head + "".join(reversed(lines))
        out.append(block)
        total += len(block)

    DIGEST.write_text("".join(out), encoding="utf-8")
    DIGEST.chmod(0o600)
    print(f"{len(sessions)} sessions, {total} chars → {DIGEST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
