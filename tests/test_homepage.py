from fastapi.testclient import TestClient

from gmi_hackathon.api import AppDependencies, create_app


class HomePipeline:
    def run(self, request):
        raise AssertionError("not used")


def test_homepage_responds_with_ui_shell():
    app = create_app(AppDependencies(pipeline=HomePipeline()))
    client = TestClient(app)

    response = client.get("/")

    assert response.status_code == 200
    assert "Turn match footage into a sharp scouting brief." in response.text