from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile

import httpx
from fastapi import FastAPI
from fastapi import File, Form, UploadFile
from fastapi import HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .models import AnalysisRequest
from .pipeline import AnalysisPipeline
from .report import render_scouting_report
from .web import WEB_DIR, get_index_html


class AnalyzeBody(BaseModel):
    source: str = Field(min_length=1)
    source_type: str = "url"
    team_name: str = ""
    tournament: str = ""
    clip_minutes: int = 5


@dataclass(frozen=True)
class AppDependencies:
    pipeline: AnalysisPipeline


def _build_success_payload(result, upload_file: str | None = None) -> dict[str, object]:
    payload: dict[str, object] = {
        "packet": result.packet.to_dict(),
        "report": result.report.to_dict(),
        "rendered_report": render_scouting_report(result.report),
    }
    if upload_file:
        payload["upload_file"] = upload_file
    return payload


def _run_pipeline_or_raise(dependencies: AppDependencies, request: AnalysisRequest):
    try:
        return dependencies.pipeline.run(request)
    except httpx.HTTPStatusError as error:
        failing_url = str(error.request.url) if error.request else "unknown-url"
        raise HTTPException(
            status_code=502,
            detail={
                "message": "Upstream GMI request failed.",
                "hint": "Check GMI_BASE_URL and GMI_VIDEO_ENDPOINT in .env. Your endpoint likely returned 404/401.",
                "status_code": error.response.status_code if error.response else None,
                "url": failing_url,
            },
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Pipeline execution failed.",
                "hint": "Check server logs and verify API keys and environment values in .env.",
                "error": str(error),
            },
        ) from error


def create_app(dependencies: AppDependencies) -> FastAPI:
    app = FastAPI(title="GMI Hackathon API")

    if WEB_DIR.exists():
        app.mount("/static", StaticFiles(directory=str(WEB_DIR)), name="static")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/", response_class=HTMLResponse)
    def home() -> str:
        return get_index_html()

    @app.post("/analyze")
    def analyze(body: AnalyzeBody) -> dict[str, object]:
        request = AnalysisRequest(
            source=body.source,
            source_type=body.source_type,
            team_name=body.team_name,
            tournament=body.tournament,
            clip_minutes=body.clip_minutes,
        )
        result = _run_pipeline_or_raise(dependencies, request)
        return _build_success_payload(result)

    @app.post("/analyze-upload")
    async def analyze_upload(
        file: UploadFile = File(...),
        team_name: str = Form(""),
        tournament: str = Form(""),
        clip_minutes: int = Form(5),
    ) -> dict[str, object]:
        suffix = Path(file.filename or "clip.bin").suffix or ".bin"
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        request = AnalysisRequest(
            source=temp_path,
            source_type="upload",
            team_name=team_name,
            tournament=tournament,
            clip_minutes=clip_minutes,
        )
        result = _run_pipeline_or_raise(dependencies, request)
        return _build_success_payload(result, upload_file=file.filename)

    return app


def build_default_app(pipeline: AnalysisPipeline) -> FastAPI:
    return create_app(AppDependencies(pipeline=pipeline))