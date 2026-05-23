from __future__ import annotations

import argparse
import sys
from pathlib import Path

import uvicorn

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gmi_hackathon.api import AppDependencies, create_app
from gmi_hackathon.config import Settings
from gmi_hackathon.factory import build_default_dependencies


def build_app():
    dependencies = build_default_dependencies()
    return create_app(AppDependencies(pipeline=dependencies.pipeline))


app = build_app()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the GMI hackathon web app.")
    parser.add_argument("--host", default=Settings.from_env().app_host)
    parser.add_argument("--port", type=int, default=Settings.from_env().app_port)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()