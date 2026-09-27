#!/usr/bin/env python
"""
Run STEM Intellect Python Math & Vision Backend
Starts FastAPI server on http://127.0.0.1:8000
"""

import sys
import os

# Add workspace directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from python_backend.api_server import start_server

if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_BACKEND_PORT", 8000))
    host = os.environ.get("PYTHON_BACKEND_HOST", "127.0.0.1")
    start_server(host=host, port=port)
