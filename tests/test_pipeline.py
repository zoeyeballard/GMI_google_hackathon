from gmi_hackathon.models import AnalysisRequest, ContextHit, ScoutingReport
from gmi_hackathon.pipeline import AnalysisPipeline


class FakeVideoAnalyzer:
    def __init__(self):
        self.calls = []

    def analyze(self, source: str, prompt: str, source_type: str = "url") -> dict:
        self.calls.append((source, prompt, source_type))
        return {
            "observations": [
                {"timestamp_s": 12.5, "label": "press trigger", "confidence": 0.91, "details": "Triggered on back pass."},
            ],
            "historical_queries": ["compact mid-block", "left wing overlap"],
        }


class FakeContextRetriever:
    def __init__(self):
        self.calls = []

    def search(self, query: str, limit: int = 3):
        self.calls.append((query, limit))
        return [ContextHit(source="match-01", note="Comparable compact block", similarity_reason="Same pressing shape")]


class FakeReportGenerator:
    def __init__(self):
        self.calls = []

    def generate(self, packet, prompt: str) -> ScoutingReport:
        self.calls.append((packet, prompt))
        return ScoutingReport(
            team_profile="Compact mid-block.",
            key_threats=["Left winger"],
            set_piece_tendencies=["Near post"],
            historical_context=["Similar side"],
            coaching_recommendations=["Attack the half-space"],
            evidence=["Synthetic"],
        )


def test_pipeline_threads_all_dependencies():
    video_analyzer = FakeVideoAnalyzer()
    context_retriever = FakeContextRetriever()
    report_generator = FakeReportGenerator()
    pipeline = AnalysisPipeline(video_analyzer, context_retriever, report_generator)

    result = pipeline.run(AnalysisRequest(source="https://example.com/clip", team_name="Cabo Verde", tournament="World Cup"))

    assert video_analyzer.calls
    assert context_retriever.calls[0][0].startswith("Cabo Verde World Cup")
    assert report_generator.calls
    assert result.packet.observations[0].label == "press trigger"
    assert result.report.team_profile == "Compact mid-block."