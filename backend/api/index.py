"""Vercel serverless entrypoint.

Vercel's Python runtime serves the module-level ASGI `app`. All routes are
rewritten to this function (see vercel.json) and FastAPI handles its own paths.
"""

import os
import sys

# Ensure the backend root (which holds the `app` package) is importable.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402  (path set up above)

__all__ = ["app"]
