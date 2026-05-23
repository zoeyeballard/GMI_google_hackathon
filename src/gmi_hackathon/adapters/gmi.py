from __future__ import annotations

from typing import Any

import httpx


def normalize_gmi_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "observations": list(payload.get("observations", [])),
        "formations": list(payload.get("formations", [])),
        "key_players": list(payload.get("key_players", [])),
        "set_pieces": list(payload.get("set_pieces", [])),
        "confidence_notes": list(payload.get("confidence_notes", [])),
        "historical_queries": list(payload.get("historical_queries", [])),
    }


class GMIHttpVideoAnalyzer:
    def __init__(self, base_url: str, api_key: str, endpoint_path: str = "/v1/video/analyze", transport: httpx.BaseTransport | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.endpoint_path = endpoint_path
        self._client = httpx.Client(base_url=self.base_url, transport=transport, timeout=60.0)

    def analyze(self, source: str, prompt: str, source_type: str = "url") -> dict[str, Any]:
        payload: dict[str, Any] = {
            "source": source,
            "source_type": source_type,
            "prompt": prompt,
        }

        response = self._client.post(
            self.endpoint_path,
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=payload,
        )
        response.raise_for_status()
        return normalize_gmi_payload(response.json())

    def close(self) -> None:
        self._client.close()