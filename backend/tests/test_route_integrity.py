from collections import Counter

from fastapi.routing import APIRoute

from app.main import app


def test_api_has_no_duplicate_method_path_routes() -> None:
    pairs: list[tuple[str, str]] = []
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods or set():
            if method in {"HEAD", "OPTIONS"}:
                continue
            pairs.append((method, route.path))

    duplicates = sorted(pair for pair, count in Counter(pairs).items() if count > 1)
    assert duplicates == []
