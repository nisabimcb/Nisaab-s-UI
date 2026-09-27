#!/usr/bin/env python
"""
STEM Intellect - Python Symbolic Math & Computer Vision Engine
Setup & One-Click Dependency Installer

Usage:
    python setup.py          # Automatically checks & installs all libraries, then verifies SymPy
    python setup.py install  # Standard setuptools installation
    python setup.py --start  # Installs libraries and immediately boots the math backend server
"""

import sys
import subprocess
import os

DEPENDENCIES = [
    "sympy>=1.13.0",
    "fastapi>=0.115.0",
    "uvicorn>=0.30.0",
    "pydantic>=2.7.0",
    "google-genai>=2.0.0",
    "pillow>=10.0.0",
    "numpy>=1.26.0",
    "pdfplumber>=0.11.0",
    "pypdf>=4.0.0",
    "requests>=2.31.0",
    "python-multipart>=0.0.9"
]


def install_all_libraries():
    """Install all necessary Python libraries via pip."""
    print("=" * 65)
    print("[*] STEM Intellect: Python Symbolic Math & Vision Backend Setup")
    print("=" * 65)
    print(f"[*] Python Interpreter: {sys.executable}")
    print(f"[*] Python Version:     {sys.version.split()[0]}")
    print("[*] Installing / Verifying required libraries...\n")

    cmd = [sys.executable, "-m", "pip", "install"] + DEPENDENCIES
    try:
        res = subprocess.run(cmd, check=True)
        print("\n" + "=" * 65)
        print("[SUCCESS] All Python libraries have been installed and verified!")
        print("=" * 65)

        # Quick SymPy Verification
        try:
            import sympy as sp
            print(f"[OK] SymPy Computer Algebra System: v{sp.__version__} (Active)")
            import fastapi
            print(f"[OK] FastAPI Engine:               v{fastapi.__version__} (Active)")
            import uvicorn
            print(f"[OK] Uvicorn ASGI Server:          v{uvicorn.__version__} (Active)")
        except ImportError as e:
            print(f"[!] Warning: {e}")

        print("\nHow to launch the Python Math Backend Server:")
        print("    python run_python_backend.py")
        print("    -- OR --")
        print("    python -m python_backend.cli serve --port 8000\n")

    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Error during library installation: {e}")
        sys.exit(1)


# If user runs `python setup.py` with no args or with `--start` or `--install-deps`
if len(sys.argv) == 1 or "--start" in sys.argv or "--install-deps" in sys.argv:
    should_start = "--start" in sys.argv
    install_all_libraries()

    if should_start:
        print("[*] Launching Python Math Backend Server on http://127.0.0.1:8000 ...")
        from python_backend.api_server import start_server
        start_server(port=8000)
    else:
        print("Tip: Run 'python setup.py --start' or 'python run_python_backend.py' to run the backend.")
    sys.exit(0)

# Otherwise, delegate to standard setuptools
try:
    from setuptools import setup, find_packages

    setup(
        name="stem-intellect-math-backend",
        version="1.0.0",
        description="Python Symbolic Math & Computer Vision Engine for STEM Intellect",
        author="STEM Intellect Team",
        packages=find_packages(),
        install_requires=DEPENDENCIES,
        entry_points={
            "console_scripts": [
                "stem-math-cli=python_backend.cli:main",
                "stem-math-server=python_backend.api_server:start_server",
            ],
        },
        python_requires=">=3.9",
    )
except ImportError:
    # If setuptools is not present, fall back to installing dependencies directly
    install_all_libraries()
