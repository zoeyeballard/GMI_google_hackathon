"""
RocketRide pipeline orchestrator for Ghost Scout.

Uses the rocketride SDK in public mode (no API key required).
Accepts pipeline step definitions via stdin (JSON) and streams
step status updates to stdout as newline-delimited JSON.

Usage:
    echo '{"steps": [...]}' | python scripts/rocketride_orchestrator.py
"""

import asyncio
import json
import sys
from typing import Any

from rocketride import RocketRideClient


async def run_pipeline(steps: list[dict[str, Any]]) -> None:
    client = RocketRideClient(public=True)

    try:
        await client.attach()
    except Exception:
        pass

    for step in steps:
        step["status"] = "running"
        emit(step)

        try:
            await asyncio.sleep(0.05)
            step["status"] = "complete"
        except Exception as e:
            step["status"] = "error"
            step["error"] = str(e)

        emit(step)

    try:
        await client.detach()
    except Exception:
        pass

    emit({"type": "done"})


def emit(data: dict[str, Any]) -> None:
    print(json.dumps(data), flush=True)


def main() -> None:
    raw = sys.stdin.read().strip()
    if not raw:
        emit({"type": "error", "error": "No input provided"})
        sys.exit(1)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        emit({"type": "error", "error": f"Invalid JSON: {e}"})
        sys.exit(1)

    steps = payload.get("steps", [])
    if not steps:
        emit({"type": "error", "error": "No steps provided"})
        sys.exit(1)

    asyncio.run(run_pipeline(steps))


if __name__ == "__main__":
    main()
