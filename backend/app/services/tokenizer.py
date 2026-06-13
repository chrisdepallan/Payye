"""Word tokenizer shared by the reader engine.

Tokens are split on whitespace so trailing punctuation stays attached to its
word. The reader uses that punctuation to decide how long to hold each word.
"""

import re

_TOKEN_RE = re.compile(r"\S+")


def tokenize(text: str) -> list[str]:
    if not text:
        return []
    return _TOKEN_RE.findall(text.strip())


def count_words(text: str) -> int:
    return len(tokenize(text))
