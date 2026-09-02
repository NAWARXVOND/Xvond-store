from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "xvond-store-api"}


def test_admin_requires_authentication() -> None:
    response = TestClient(app).get("/api/v1/admin/overview")
    assert response.status_code == 401
