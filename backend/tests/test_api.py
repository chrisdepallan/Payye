SAMPLE_TEXT = "Hello world. This is a focused reading test for Payye."


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_register_login_and_me(client):
    resp = client.post(
        "/auth/register",
        json={"name": "Grace", "email": "grace@example.com", "password": "hopper42"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["email"] == "grace@example.com"
    assert body["access_token"]

    # Duplicate email is rejected.
    dup = client.post(
        "/auth/register",
        json={"name": "Grace", "email": "grace@example.com", "password": "hopper42"},
    )
    assert dup.status_code == 409

    # Wrong password fails.
    bad = client.post(
        "/auth/login",
        json={"email": "grace@example.com", "password": "wrong"},
    )
    assert bad.status_code == 401

    login = client.post(
        "/auth/login",
        json={"email": "grace@example.com", "password": "hopper42"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Grace"


def test_requires_auth(client):
    assert client.get("/documents").status_code == 401


def test_document_crud_and_word_count(auth_client):
    resp = auth_client.post(
        "/documents", json={"title": "Test", "text_content": SAMPLE_TEXT}
    )
    assert resp.status_code == 201
    doc = resp.json()
    assert doc["word_count"] == 10  # whitespace-split tokens
    doc_id = doc["id"]

    listed = auth_client.get("/documents")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    detail = auth_client.get(f"/documents/{doc_id}")
    assert detail.status_code == 200
    assert detail.json()["text_content"] == SAMPLE_TEXT

    deleted = auth_client.delete(f"/documents/{doc_id}")
    assert deleted.status_code == 204
    assert auth_client.get(f"/documents/{doc_id}").status_code == 404


def test_session_lifecycle(auth_client):
    doc_id = auth_client.post(
        "/documents", json={"title": "Doc", "text_content": SAMPLE_TEXT}
    ).json()["id"]

    started = auth_client.post("/sessions/start", json={"document_id": doc_id, "wpm": 300})
    assert started.status_code == 200
    session = started.json()
    assert session["current_word_index"] == 0
    assert session["wpm"] == 300
    assert session["document"]["id"] == doc_id
    session_id = session["id"]

    # Starting again resumes the same session rather than creating a new one.
    again = auth_client.post("/sessions/start", json={"document_id": doc_id})
    assert again.json()["id"] == session_id

    updated = auth_client.patch(
        f"/sessions/{session_id}", json={"current_word_index": 4, "status": "paused"}
    )
    assert updated.status_code == 200
    assert updated.json()["current_word_index"] == 4
    assert updated.json()["status"] == "paused"

    current = auth_client.get("/sessions/current")
    assert current.status_code == 200
    assert current.json()["id"] == session_id

    history = auth_client.get("/sessions/history")
    assert len(history.json()) == 1

    done = auth_client.patch(f"/sessions/{session_id}", json={"status": "completed"})
    assert done.json()["completed_at"] is not None
    assert auth_client.get("/sessions/current").json() is None


def test_settings(auth_client):
    resp = auth_client.get("/settings")
    assert resp.status_code == 200
    assert resp.json()["default_wpm"] == 250

    patched = auth_client.patch("/settings", json={"default_wpm": 400, "theme": "light"})
    assert patched.status_code == 200
    assert patched.json()["default_wpm"] == 400
    assert patched.json()["theme"] == "light"


def test_ai_summary_and_keywords_fallback(auth_client):
    doc_id = auth_client.post(
        "/documents",
        json={
            "title": "AI Doc",
            "text_content": (
                "Reading efficiency improves with focus. Focus reduces distraction. "
                "Distraction lowers comprehension and retention over time."
            ),
        },
    ).json()["id"]

    summary = auth_client.post("/ai/summary", json={"document_id": doc_id})
    assert summary.status_code == 200
    assert summary.json()["summary"]
    assert summary.json()["cached"] is False

    # Second call is served from cache.
    cached = auth_client.post("/ai/summary", json={"document_id": doc_id})
    assert cached.json()["cached"] is True

    keywords = auth_client.post("/ai/keywords", json={"document_id": doc_id})
    assert keywords.status_code == 200
    assert isinstance(keywords.json()["keywords"], list)
    assert keywords.json()["difficulty_level"] in {"Beginner", "Intermediate", "Advanced"}

    vocab = auth_client.post(
        "/ai/vocabulary-help", json={"word": "comprehension"}
    )
    assert vocab.status_code == 200
    assert vocab.json()["definition"]
