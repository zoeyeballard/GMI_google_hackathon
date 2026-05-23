from __future__ import annotations

from dataclasses import dataclass

from google import genai

from .adapters.gmi import GMIHttpVideoAnalyzer
from .adapters.google_ai_studio import GoogleAIStudioReportGenerator
from .adapters.rocketride import RocketRideContextRetriever
from .config import Settings
from .local_context import LocalContextCorpus
from .models import AnalysisPacket
from .pipeline import AnalysisPipeline


class GoogleGenAIClientAdapter:
    def __init__(self, api_key: str):
        self._client = genai.Client(api_key=api_key)

    def generate_content(self, model: str, prompt: str):
        return self._client.models.generate_content(model=model, contents=prompt)


@dataclass(frozen=True)
class DefaultDependencies:
    settings: Settings
    pipeline: AnalysisPipeline


def build_default_pipeline(settings: Settings) -> AnalysisPipeline:
    context_corpus = LocalContextCorpus.load()
    video_analyzer = GMIHttpVideoAnalyzer(
        base_url=settings.gmi_base_url,
        api_key=settings.gmi_api_key,
        endpoint_path=settings.gmi_video_endpoint,
    )
    context_retriever = RocketRideContextRetriever(corpus=context_corpus)
    report_generator = GoogleAIStudioReportGenerator(
        client=GoogleGenAIClientAdapter(settings.google_api_key),
        model_name=settings.gemini_model,
    )
    return AnalysisPipeline(video_analyzer=video_analyzer, context_retriever=context_retriever, report_generator=report_generator)


def build_default_dependencies(settings: Settings | None = None) -> DefaultDependencies:
    resolved_settings = settings or Settings.from_env()
    return DefaultDependencies(settings=resolved_settings, pipeline=build_default_pipeline(resolved_settings))