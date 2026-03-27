#!/usr/bin/env python3
"""
Splink puzzle generator.

Finds compound word bridge puzzles of the form:

    WORD1 + ANSWER + WORD2

where  WORD1+ANSWER  and  ANSWER+WORD2  are both valid closed compound words,
then writes one JSON file per day ready to serve from S3.

Usage
-----
    cd backend
    pip install -r requirements.txt

    # Generate & write 365 daily files (default output: .cache/daily/):
    python generate_puzzles.py --days 365

    # Start from a specific date:
    python generate_puzzles.py --start 2026-04-01 --days 90

    # Upload directly to S3 (needs SPLINK_BUCKET env var + AWS credentials):
    python generate_puzzles.py --days 365 --upload

    # Force re-download the word list:
    python generate_puzzles.py --download --days 7

    # Dry run — print what each day would get, no files written:
    python generate_puzzles.py --days 7 --dry-run

Output
------
    pool/YYYY-MM-DD.json   one file per day, each a list of 5 puzzles
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import random
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

# ── Optional wordfreq ─────────────────────────────────────────────────────────

try:
    from wordfreq import word_frequency  # type: ignore

    HAS_WORDFREQ = True
except ImportError:
    HAS_WORDFREQ = False
    print(
        "Warning: wordfreq not installed — frequency filtering disabled.\n"
        "Install with: pip install wordfreq",
        file=sys.stderr,
    )

# ── Paths ─────────────────────────────────────────────────────────────────────

CACHE_DIR = Path(__file__).parent / ".cache"
WORDS_FILE = CACHE_DIR / "words_alpha.txt"
APPROVED_FILE = CACHE_DIR / "approved.json"
REVIEWED_FILE = CACHE_DIR / "reviewed_keys.json"
DAILY_DIR = Path(__file__).parent / "pool"

# ── Tuning ────────────────────────────────────────────────────────────────────

WORDS_URL = (
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
)

MIN_PART_LEN = 3  # minimum chars in word1, answer, word2
MAX_PART_LEN = 10  # maximum chars in word1, answer, word2
MAX_COMPOUND_LEN = 18  # maximum total compound word length
MIN_FREQ: float = 4e-6  # wordfreq threshold (~top 30-40k English words)

PUZZLES_PER_DAY = 5
EPOCH = datetime.date(2026, 3, 24)  # day 0 of the puzzle calendar
SHUFFLE_SEED = 42

# ── Download ──────────────────────────────────────────────────────────────────


def download_words(force: bool = False) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if WORDS_FILE.exists() and not force:
        print(
            f"[cache] word list already present ({WORDS_FILE.stat().st_size:,} bytes)"
        )
        return
    print(f"Downloading word list from {WORDS_URL} …")
    urllib.request.urlretrieve(WORDS_URL, WORDS_FILE)
    print(f"Saved {WORDS_FILE.stat().st_size:,} bytes → {WORDS_FILE}")


# ── Load ──────────────────────────────────────────────────────────────────────


def load_words() -> set[str]:
    words: set[str] = set()
    with open(WORDS_FILE) as fh:
        for line in fh:
            w = line.strip().lower()
            if w.isalpha() and 2 <= len(w) <= MAX_COMPOUND_LEN:
                words.add(w)
    print(f"Loaded {len(words):,} words")
    return words


# ── Index ─────────────────────────────────────────────────────────────────────


def build_index(words: set[str]) -> tuple[
    dict[str, list[tuple[str, str]]],
    dict[str, list[tuple[str, str]]],
]:
    by_right: defaultdict[str, list] = defaultdict(list)
    by_left: defaultdict[str, list] = defaultdict(list)
    total = len(words)

    for n, word in enumerate(words):
        if n % 50_000 == 0:
            print(f"  indexing {n:,} / {total:,} …", end="\r", flush=True)
        length = len(word)
        for k in range(MIN_PART_LEN, length - MIN_PART_LEN + 1):
            left, right = word[:k], word[k:]
            if len(left) > MAX_PART_LEN or len(right) > MAX_PART_LEN:
                continue
            if left not in words or right not in words:
                continue
            by_right[right].append((left, word))
            by_left[left].append((right, word))

    print(f"\nRight-index: {sum(len(v) for v in by_right.values()):,} entries")
    print(f"Left-index:  {sum(len(v) for v in by_left.values()):,} entries")
    return dict(by_right), dict(by_left)


# ── Frequency ─────────────────────────────────────────────────────────────────


def is_common(word: str) -> bool:
    if not HAS_WORDFREQ:
        return True
    return word_frequency(word, "en") >= MIN_FREQ  # type: ignore[no-untyped-call]


# ── Generate ──────────────────────────────────────────────────────────────────

_STOPWORDS = {
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "any",
    "can",
    "her",
    "was",
    "one",
    "our",
    "out",
    "day",
    "get",
    "has",
    "him",
    "his",
    "how",
    "man",
    "new",
    "now",
    "old",
    "see",
    "two",
    "way",
    "who",
    "its",
    "let",
    "put",
    "say",
    "she",
    "too",
    "use",
    "may",
    "own",
}


def generate(
    by_right: dict[str, list[tuple[str, str]]],
    by_left: dict[str, list[tuple[str, str]]],
) -> list[dict]:
    puzzles: list[dict] = []
    seen: set[tuple[str, str, str]] = set()
    answers = set(by_right) & set(by_left)
    total = len(answers)
    print(f"{total:,} candidate answer words")

    for n, answer in enumerate(answers):
        if n % 10_000 == 0:
            print(f"  scanning {n:,} / {total:,} …", end="\r", flush=True)
        if answer in _STOPWORDS or not is_common(answer):
            continue
        for word1, compound1 in by_right[answer]:
            if word1 == answer or word1 in _STOPWORDS or not is_common(word1):
                continue
            if not is_common(compound1):
                continue
            for word2, compound2 in by_left[answer]:
                if word2 in (answer, word1) or word2 in _STOPWORDS:
                    continue
                if not is_common(word2) or not is_common(compound2):
                    continue
                key = (word1, word2, answer)
                if key in seen:
                    continue
                seen.add(key)
                puzzles.append(
                    {
                        "word1": word1.upper(),
                        "word2": word2.upper(),
                        "answer": answer.upper(),
                        "_c1": compound1.upper(),
                        "_c2": compound2.upper(),
                    }
                )

    print(f"\nGenerated {len(puzzles):,} puzzles")
    return puzzles


# ── Review ────────────────────────────────────────────────────────────────────


def review_puzzles(puzzles: list[dict]) -> None:
    """Interactively approve/reject answer words; persists state to CACHE_DIR."""
    approved_answers: set[str] = set()
    reviewed_answers: set[str] = set()

    if APPROVED_FILE.exists():
        approved_answers = set(json.loads(APPROVED_FILE.read_text(encoding="utf-8")))
        reviewed_answers.update(approved_answers)

    if REVIEWED_FILE.exists():
        reviewed_answers.update(json.loads(REVIEWED_FILE.read_text(encoding="utf-8")))

    # Deduplicate answers, preserving insertion order
    all_answers = list(dict.fromkeys(p["answer"] for p in puzzles))
    pending = [a for a in all_answers if a not in reviewed_answers]

    print(
        f"{len(approved_answers)} approved  |  {len(pending)} answers left to review"
        "  |  y=approve  n=skip  q=quit"
    )

    for i, answer in enumerate(pending):
        print(f"\n[{i + 1}/{len(pending)}]  {answer}")
        while True:
            ch = input("  [y/n/q]: ").strip().lower()
            if ch in ("y", "n", "q"):
                break

        reviewed_answers.add(answer)
        if ch == "y":
            approved_answers.add(answer)
        if ch == "q":
            break

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    APPROVED_FILE.write_text(
        json.dumps(sorted(approved_answers), indent=2), encoding="utf-8"
    )
    REVIEWED_FILE.write_text(json.dumps(sorted(reviewed_answers)), encoding="utf-8")
    print(f"\n{len(approved_answers)} approved answers saved → {APPROVED_FILE}")


# ── Assign to dates ───────────────────────────────────────────────────────────


def assign_dates(
    puzzles: list[dict], start: datetime.date, days: int
) -> dict[datetime.date, list[dict]]:
    """
    Deterministically assign PUZZLES_PER_DAY puzzles to each date.
    Uses a fixed shuffle so the same run always produces the same schedule.
    """
    rng = random.Random(SHUFFLE_SEED)
    pool = puzzles.copy()
    rng.shuffle(pool)
    n = len(pool)

    schedule: dict[datetime.date, list[dict]] = {}
    cursor = 0
    for i in range(days):
        date = start + datetime.timedelta(days=i)
        day_puzzles: list[dict] = []
        used_answers: set[str] = set()
        checked = 0
        while len(day_puzzles) < PUZZLES_PER_DAY and checked < n:
            p = pool[(cursor + checked) % n]
            checked += 1
            if p["answer"] not in used_answers:
                day_puzzles.append(p)
                used_answers.add(p["answer"])
        cursor = (cursor + checked) % n
        schedule[date] = day_puzzles

    return schedule


# ── Output ────────────────────────────────────────────────────────────────────


def clean(puzzle: dict) -> dict:
    """Strip internal-only fields before writing."""
    return {
        "word1": puzzle["word1"],
        "word2": puzzle["word2"],
        "answer": puzzle["answer"],
    }


def write_daily(schedule: dict[datetime.date, list[dict]], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for date, puzzles in sorted(schedule.items()):
        path = output_dir / f"{date.isoformat()}.json"
        path.write_text(json.dumps([clean(p) for p in puzzles]), encoding="utf-8")
    print(f"Wrote {len(schedule)} daily files → {output_dir}/")


def upload_daily(
    schedule: dict[datetime.date, list[dict]], bucket: str, prefix: str
) -> None:
    try:
        import boto3  # type: ignore
    except ImportError:
        sys.exit("boto3 not installed — run: pip install boto3")

    s3 = boto3.client("s3")
    for date, puzzles in sorted(schedule.items()):
        key = f"{prefix}{date.isoformat()}.json"
        body = json.dumps([clean(p) for p in puzzles])
        s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=body,
            ContentType="application/json",
            CacheControl="public, max-age=86400",
        )
        print(f"  s3://{bucket}/{key}")
    print(f"Uploaded {len(schedule)} files")


# ── CLI ───────────────────────────────────────────────────────────────────────


def main() -> None:

    global MIN_FREQ
    ap = argparse.ArgumentParser(description="Generate Splink daily puzzle files")
    ap.add_argument(
        "--download", action="store_true", help="Force re-download the word list"
    )
    ap.add_argument(
        "--start",
        metavar="YYYY-MM-DD",
        help="First date to generate (default: today UTC)",
    )
    ap.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of daily files to produce (default: 7)",
    )
    ap.add_argument(
        "--min-freq",
        type=float,
        default=MIN_FREQ,
        metavar="F",
        help=f"Minimum wordfreq frequency (default {MIN_FREQ})",
    )
    ap.add_argument(
        "--upload",
        action="store_true",
        help="Upload to S3 (requires SPLINK_BUCKET env var + AWS credentials)",
    )
    ap.add_argument(
        "--prefix", default="puzzles/", help="S3 key prefix (default: puzzles/)"
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Print schedule without writing or uploading anything",
    )
    ap.add_argument(
        "--review",
        action="store_true",
        help="Interactively approve/reject generated puzzles (saves to .cache/approved.json)",
    )
    ap.add_argument(
        "--approved-only",
        action="store_true",
        help="Use only manually approved puzzles from .cache/approved.json",
    )
    args = ap.parse_args()

    MIN_FREQ = args.min_freq

    start = (
        datetime.date.fromisoformat(args.start) if args.start else datetime.date.today()
    )

    download_words(force=args.download)
    words = load_words()
    by_right, by_left = build_index(words)
    puzzles = generate(by_right, by_left)

    if args.review:
        review_puzzles(puzzles)
        return

    if args.approved_only:
        if not APPROVED_FILE.exists():
            sys.exit("No approved answers found — run with --review first.")
        approved_answers = set(json.loads(APPROVED_FILE.read_text(encoding="utf-8")))
        puzzles = [p for p in puzzles if p["answer"] in approved_answers]
        print(f"Filtered to {len(puzzles)} puzzles with approved answers")

    schedule = assign_dates(puzzles, start, args.days)

    if args.dry_run:
        for date, day_puzzles in sorted(schedule.items()):
            print(f"\n{date}  (day {(date - EPOCH).days})")
            for p in day_puzzles:
                suffix = f"  — {p['_c1']} · {p['_c2']}" if "_c1" in p else ""
                print(f"  {p['word1']} + {p['answer']} + {p['word2']}{suffix}")
        print("\n(dry run — nothing written)")
        return

    if args.upload:
        bucket = os.environ.get("SPLINK_BUCKET", "")
        if not bucket:
            sys.exit("SPLINK_BUCKET environment variable is not set.")
        upload_daily(schedule, bucket, args.prefix)
    else:
        write_daily(schedule, DAILY_DIR)
        print(
            f"\nTo upload:  aws s3 sync backend/pool/ s3://$SPLINK_BUCKET/{args.prefix}"
        )


if __name__ == "__main__":
    main()
