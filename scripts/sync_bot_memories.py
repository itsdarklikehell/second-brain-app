#!/usr/bin/env python3
"""Sync bot-memories (Hermes/OpenClaw) naar de Second Brain API.

Leest memory-bestanden van Corneel, Dorus en Maarten en POST ze als
BrainItems (type=note) naar de second-brain-app. Idempotent op basis van id.
"""
import json
import os
import sys
import urllib.request

API = os.environ.get("BRAIN_API", "http://127.0.0.1:3000/api/items")

SOURCES = [
    ("corneel-hermes", "/home/hans/.hermes/memories"),
    ("dorus-openclaw", "/home/hans/.openclaw/workspace/memory"),
    ("maarten-hermes", None),  # via ssh: pct exec 108 (optioneel)
]


def read_memories(source_id: str, mem_dir: str) -> list:
    items = []
    if not mem_dir or not os.path.isdir(mem_dir):
        return items
    for fname in sorted(os.listdir(mem_dir)):
        if not fname.endswith((".md", ".txt")):
            continue
        path = os.path.join(mem_dir, fname)
        try:
            content = open(path, encoding="utf-8").read()
        except OSError:
            continue
        if not content.strip():
            continue
        items.append({
            "id": f"{source_id}:{fname}",
            "type": "note",
            "title": fname,
            "content": content[:10000],
            "tags": [source_id, "memory"],
            "createdAt": str(os.path.getmtime(path)),
            "updatedAt": str(os.path.getmtime(path)),
        })
    return items


def push(items: list) -> int:
    if not items:
        return 0
    req = urllib.request.Request(
        API,
        data=json.dumps(items).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.load(resp)
    return result.get("added", 0)


def main():
    total = 0
    for source_id, mem_dir in SOURCES:
        items = read_memories(source_id, mem_dir)
        added = push(items)
        print(f"{source_id}: {len(items)} bestanden, {added} nieuw")
        total += added
    print(f"totaal gesynchroniseerd: {total}")


if __name__ == "__main__":
    sys.exit(main())
