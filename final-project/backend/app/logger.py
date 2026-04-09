import os
from datetime import datetime

LOG_DIR = "logs"
LOG_FILE = os.path.join(LOG_DIR, "moderation_log.txt")
COUNTER_FILE = os.path.join(LOG_DIR, "counter.txt")

BLOCKED_FILE = os.path.join(LOG_DIR, "blocked.txt")
ALLOWED_FILE = os.path.join(LOG_DIR, "allowed.txt")


def ensure_logs_dir():
    os.makedirs(LOG_DIR, exist_ok=True)


def get_next_id():
    ensure_logs_dir()

    if not os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, "w") as f:
            f.write("1")
        return 1

    with open(COUNTER_FILE, "r") as f:
        current = int(f.read().strip())

    next_id = current + 1

    with open(COUNTER_FILE, "w") as f:
        f.write(str(next_id))

    return next_id


def format_log(entry_id, text, platform, label, score, is_toxic):
    return (
        "=" * 60 + "\n"
        f"ID: {entry_id}\n"
        f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Platform: {platform}\n"
        f"Text: {text}\n"
        f"Label: {label}\n"
        f"Score: {score}\n"
        f"Blocked: {is_toxic}\n"
        + "=" * 60 + "\n\n"
    )


def log_prediction(text, platform, label, score, is_toxic):
    ensure_logs_dir()

    entry_id = get_next_id()
    log_text = format_log(entry_id, text, platform, label, score, is_toxic)

    # קובץ ראשי
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_text)

    # קובץ רק של חסומים
    if is_toxic:
        with open(BLOCKED_FILE, "a", encoding="utf-8") as f:
            f.write(log_text)
    else:
        # קובץ רק של לא חסומים
        with open(ALLOWED_FILE, "a", encoding="utf-8") as f:
            f.write(log_text)