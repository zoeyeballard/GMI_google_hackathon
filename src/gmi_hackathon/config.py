from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    gmi_api_key: str = ""
    gmi_base_url: str = "https://api.example.com"
    gmi_video_endpoint: str = "/v1/video/analyze"
    rocketride_vector_url: str = "sqlite:///./data/vector.db"
    rocketride_collection: str = "scouting_context"
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        return cls(
            gmi_api_key=os.getenv("GMI_API_KEY", ""),
            gmi_base_url=os.getenv("GMI_BASE_URL", "https://api.example.com"),
            gmi_video_endpoint=os.getenv("GMI_VIDEO_ENDPOINT", "/v1/video/analyze"),
            rocketride_vector_url=os.getenv("ROCKETRIDE_VECTOR_URL", "sqlite:///./data/vector.db"),
            rocketride_collection=os.getenv("ROCKETRIDE_COLLECTION", "scouting_context"),
            google_api_key=os.getenv("GOOGLE_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            app_env=os.getenv("APP_ENV", "development"),
            app_host=os.getenv("APP_HOST", "127.0.0.1"),
            app_port=int(os.getenv("APP_PORT", "8000")),
        )