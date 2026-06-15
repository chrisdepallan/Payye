"""AI helpers for summaries, keywords, difficulty, vocabulary, simplify, quiz, chat.

If OPENAI_API_KEY is configured the service calls OpenAI; otherwise it falls
back to lightweight local heuristics where that is possible so the core
endpoints keep working offline. The backend is fully stateless — every request
carries the text it operates on and nothing is persisted.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from typing import Dict, List, Optional, Tuple

from app.core.config import settings

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "of", "to", "in", "on",
    "for", "with", "as", "is", "are", "was", "were", "be", "been", "being",
    "it", "its", "this", "that", "these", "those", "at", "by", "from", "up",
    "out", "about", "into", "over", "after", "so", "than", "too", "very", "can",
    "will", "just", "not", "no", "do", "does", "did", "has", "have", "had",
    "he", "she", "they", "we", "you", "i", "him", "her", "them", "his", "our",
    "your", "their", "what", "which", "who", "whom", "when", "where", "why",
    "how", "all", "any", "both", "each", "more", "most", "some", "such", "only",
    "own", "same", "there", "here", "also", "because", "while",
}

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z'-]+")
_SENT_RE = re.compile(r"(?<=[.!?])\s+")


def _client():
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI

        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception:  # pragma: no cover - openai missing / import error
        return None


def _chat(
    user_prompt: str,
    system: str = "You are a helpful reading assistant.",
    history: Optional[List[Dict[str, str]]] = None,
) -> Optional[str]:
    client = _client()
    if client is None:
        return None
    messages: List[Dict[str, str]] = [{"role": "system", "content": system}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_prompt})
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.3,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception:  # pragma: no cover - network/auth errors fall back
        return None


def _extract_json(raw: str) -> Optional[dict]:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


# --------------------------------------------------------------------------- #
# Summary
# --------------------------------------------------------------------------- #
def generate_summary(text: str) -> str:
    ai = _chat(
        "Summarize the following text in 3-4 concise sentences, focusing on the "
        "key ideas.\n\n" + text[:8000]
    )
    return ai or _extractive_summary(text, max_sentences=3)


def _extractive_summary(text: str, max_sentences: int = 3) -> str:
    sentences = [s.strip() for s in _SENT_RE.split(text.strip()) if s.strip()]
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    freq = Counter(
        w.lower() for w in _WORD_RE.findall(text) if w.lower() not in _STOPWORDS
    )
    if not freq:
        return " ".join(sentences[:max_sentences])

    def score(sentence: str) -> float:
        words = [w.lower() for w in _WORD_RE.findall(sentence)]
        if not words:
            return 0.0
        return sum(freq.get(w, 0) for w in words) / len(words)

    ranked = sorted(range(len(sentences)), key=lambda i: score(sentences[i]), reverse=True)
    chosen = sorted(ranked[:max_sentences])
    return " ".join(sentences[i] for i in chosen)


# --------------------------------------------------------------------------- #
# Keywords + difficulty
# --------------------------------------------------------------------------- #
def extract_keywords(text: str) -> Tuple[List[str], str]:
    ai = _chat(
        'Return a JSON object with "keywords" (array of up to 8 important '
        'keywords) and "difficulty" (one of "Beginner", "Intermediate", '
        '"Advanced"). Respond with JSON only.\n\n' + text[:8000]
    )
    if ai:
        data = _extract_json(ai)
        if data:
            keywords = [str(k) for k in data.get("keywords", [])][:8]
            difficulty = str(data.get("difficulty", "Intermediate"))
            if keywords:
                return keywords, difficulty
    return _heuristic_keywords(text), estimate_difficulty(text)


def _heuristic_keywords(text: str, limit: int = 8) -> List[str]:
    freq = Counter(
        w.lower()
        for w in _WORD_RE.findall(text)
        if w.lower() not in _STOPWORDS and len(w) > 3
    )
    return [word for word, _ in freq.most_common(limit)]


def estimate_difficulty(text: str) -> str:
    words = _WORD_RE.findall(text)
    sentences = [s for s in _SENT_RE.split(text.strip()) if s.strip()]
    if not words:
        return "Beginner"

    avg_word_len = sum(len(w) for w in words) / len(words)
    avg_sentence_len = len(words) / max(len(sentences), 1)
    score = (avg_word_len * 1.5) + (avg_sentence_len * 0.4)

    if score < 12:
        return "Beginner"
    if score < 18:
        return "Intermediate"
    return "Advanced"


# --------------------------------------------------------------------------- #
# Vocabulary help
# --------------------------------------------------------------------------- #
def vocabulary_help(word: str, context: Optional[str] = None) -> Tuple[str, Optional[str]]:
    prompt = f'Define the word "{word}" simply.'
    if context:
        prompt += f' It appears in this context: "{context[:500]}".'
    prompt += (
        ' Return a JSON object with "definition" (one sentence) and "example" '
        "(a short example sentence). Respond with JSON only."
    )
    ai = _chat(prompt)
    if ai:
        data = _extract_json(ai)
        if data:
            definition = str(data.get("definition", "")).strip()
            example = data.get("example")
            if definition:
                return definition, (str(example).strip() if example else None)
        return ai, None
    return (
        f'No offline definition is available for "{word}". '
        "Set OPENAI_API_KEY to enable AI vocabulary help.",
        None,
    )


# --------------------------------------------------------------------------- #
# Simplify
# --------------------------------------------------------------------------- #
def simplify(text: str) -> str:
    ai = _chat(
        "Rewrite the following text in plain, simpler language while keeping the "
        "meaning. Return only the rewritten text.\n\n" + text[:8000]
    )
    # Without AI we can't truly simplify; return the original unchanged.
    return ai or text


# --------------------------------------------------------------------------- #
# Comprehension quiz
# --------------------------------------------------------------------------- #
def generate_quiz(text: str, num_questions: int = 5) -> List[dict]:
    ai = _chat(
        f"Create {num_questions} multiple-choice comprehension questions about "
        "the text. Return JSON only: an object with a \"questions\" array, each "
        'item having "question" (string), "options" (array of 4 strings), '
        '"answer_index" (0-3 integer), and "explanation" (string).\n\n'
        + text[:8000]
    )
    if not ai:
        return []
    data = _extract_json(ai)
    if not data:
        return []
    questions = []
    for item in data.get("questions", []):
        try:
            questions.append(
                {
                    "question": str(item["question"]),
                    "options": [str(o) for o in item["options"]][:4],
                    "answer_index": int(item.get("answer_index", 0)),
                    "explanation": (
                        str(item["explanation"]) if item.get("explanation") else None
                    ),
                }
            )
        except (KeyError, TypeError, ValueError):
            continue
    return questions


# --------------------------------------------------------------------------- #
# Chat / Q&A about a passage
# --------------------------------------------------------------------------- #
def chat(messages: List[Dict[str, str]], text: Optional[str] = None) -> str:
    system = "You are a helpful reading assistant. Answer questions concisely."
    if text:
        system += " Base your answers on this passage:\n\n" + text[:6000]

    history = messages[:-1]
    last = messages[-1]["content"] if messages else ""
    ai = _chat(last, system=system, history=history)
    return ai or (
        "AI chat is not configured. Set OPENAI_API_KEY on the server to enable it."
    )
