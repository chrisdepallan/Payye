SAMPLE = (
    "Reading efficiency improves with focus. Focus reduces distraction. "
    "Distraction lowers comprehension and retention over time."
)
DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_config(client):
    resp = client.get("/config")
    assert resp.status_code == 200
    body = resp.json()
    assert body["ai_enabled"] is False  # forced offline in tests
    assert body["max_input_chars"] > 0


def test_summary_fallback(client):
    resp = client.post("/ai/summary", json={"text": SAMPLE})
    assert resp.status_code == 200
    assert resp.json()["summary"]


def test_keywords_fallback(client):
    resp = client.post("/ai/keywords", json={"text": SAMPLE})
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body["keywords"], list)
    assert body["difficulty_level"] in DIFFICULTIES


def test_difficulty(client):
    resp = client.post("/ai/difficulty", json={"text": SAMPLE})
    assert resp.status_code == 200
    assert resp.json()["difficulty_level"] in DIFFICULTIES


def test_vocabulary_fallback(client):
    resp = client.post("/ai/vocabulary", json={"word": "comprehension"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["word"] == "comprehension"
    assert body["definition"]


def test_simplify_returns_text_offline(client):
    resp = client.post("/ai/simplify", json={"text": SAMPLE})
    assert resp.status_code == 200
    # Offline there is no model, so the text is returned unchanged.
    assert resp.json()["text"] == SAMPLE


def test_quiz_offline_is_empty_list(client):
    resp = client.post("/ai/quiz", json={"text": SAMPLE, "num_questions": 3})
    assert resp.status_code == 200
    assert resp.json()["questions"] == []


def test_chat_offline(client):
    resp = client.post(
        "/ai/chat",
        json={"text": SAMPLE, "messages": [{"role": "user", "content": "What is this about?"}]},
    )
    assert resp.status_code == 200
    assert resp.json()["reply"]


def test_chat_rejects_empty_messages(client):
    resp = client.post("/ai/chat", json={"messages": []})
    assert resp.status_code == 422


def test_extract_txt(client):
    files = {"file": ("note.txt", b"Hello world. This is Payye.", "text/plain")}
    resp = client.post("/extract", files=files)
    assert resp.status_code == 200
    body = resp.json()
    assert body["source_type"] == "txt"
    assert body["word_count"] == 5
    assert "Payye" in body["text"]


def test_extract_rejects_unknown_type(client):
    files = {"file": ("photo.png", b"\x89PNG", "image/png")}
    resp = client.post("/extract", files=files)
    assert resp.status_code == 400


def test_input_length_guard(client):
    huge = "word " * 11000  # > 50,000 chars
    resp = client.post("/ai/summary", json={"text": huge})
    assert resp.status_code == 413
