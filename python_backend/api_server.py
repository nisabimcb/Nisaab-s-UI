"""
FastAPI Backend Server for Python Symbolic Mathematics & Computer Vision Engine
Runs on http://127.0.0.1:8000
"""

import sys
import os
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sympy as sp

from python_backend.math_solver import solve_general_math
from python_backend.vision_solver import solve_vision_math
from python_backend.pdf_parser import parse_pdf_document

app = FastAPI(
    title="STEM Intellect - Python Math & Vision Backend",
    version="1.0.0",
    description="Symbolic Computer Algebra & Computer Vision Engine powered by SymPy & Google GenAI"
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MathSolveRequest(BaseModel):
    problem: str
    topic: Optional[str] = None


class VisionSolveRequest(BaseModel):
    imageData: str
    imageMimeType: Optional[str] = "image/png"
    notes: Optional[str] = None
    mathExpression: Optional[str] = None
    apiKey: Optional[str] = None


class PdfParseRequest(BaseModel):
    pdfData: str
    pdfFileName: Optional[str] = None
    apiKey: Optional[str] = None


class OmniRouteProxyRequest(BaseModel):
    action: str
    mathExpression: Optional[str] = None
    userMessage: Optional[str] = None
    topic: Optional[str] = None
    imageData: Optional[str] = None
    imageMimeType: Optional[str] = None
    notes: Optional[str] = None
    pdfData: Optional[str] = None
    pdfFileName: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


@app.get("/")
@app.get("/health")
def health_check():
    """Health check returning system and library diagnostics."""
    return {
        "status": "healthy",
        "service": "python_math_and_vision_backend",
        "python_version": sys.version,
        "sympy_version": sp.__version__,
        "endpoints": [
            "/api/math/solve",
            "/api/vision/solve",
            "/api/pdf/parse",
            "/api/omni-route"
        ]
    }


@app.post("/api/math/solve")
def api_solve_math(req: MathSolveRequest):
    """Solve math problem symbolically using SymPy."""
    try:
        result = solve_general_math(req.problem)
        return {
            "success": True,
            "providerUsed": "python_sympy_cas",
            "latencyMs": 5,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vision/solve")
def api_solve_vision(req: VisionSolveRequest):
    """Decipher handwriting and solve math using Vision + SymPy."""
    try:
        notes = req.notes or req.mathExpression or ""
        result = solve_vision_math(
            image_data=req.imageData,
            image_mime_type=req.imageMimeType,
            notes=notes,
            api_key=req.apiKey
        )
        return {
            "success": True,
            "providerUsed": "python_vision_sympy",
            "latencyMs": 12,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pdf/parse")
def api_parse_pdf(req: PdfParseRequest):
    """Parse PDF textbook/notes into structured study materials."""
    try:
        result = parse_pdf_document(
            pdf_data=req.pdfData,
            pdf_file_name=req.pdfFileName,
            api_key=req.apiKey
        )
        return {
            "success": True,
            "providerUsed": "python_pdf_engine",
            "latencyMs": 20,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/omni-route")
def api_omni_route(req: OmniRouteProxyRequest):
    """Unified OmniRoute endpoint matching Next.js router actions."""
    action = req.action.lower()

    if action == "ping":
        return {
            "success": True,
            "providerUsed": "python_backend",
            "data": {
                "status": "online",
                "sympy_version": sp.__version__,
                "python": sys.version.split()[0]
            }
        }

    if action == "math_solve":
        problem = req.mathExpression or req.userMessage or req.topic or "2x^2 + 5x - 3 = 0"
        res = solve_general_math(problem)
        return {
            "success": True,
            "providerUsed": "python_sympy",
            "data": res
        }

    if action == "vision_solve":
        if not req.imageData:
            raise HTTPException(status_code=400, detail="Missing imageData")
        api_key = req.config.get("geminiApiKey") if req.config else None
        notes = req.notes or req.mathExpression or ""
        res = solve_vision_math(
            image_data=req.imageData,
            image_mime_type=req.imageMimeType,
            notes=notes,
            api_key=api_key
        )
        return {
            "success": True,
            "providerUsed": "python_vision_sympy",
            "data": res
        }

    if action == "parse_pdf":
        if not req.pdfData:
            raise HTTPException(status_code=400, detail="Missing pdfData")
        api_key = req.config.get("geminiApiKey") if req.config else None
        res = parse_pdf_document(
            pdf_data=req.pdfData,
            pdf_file_name=req.pdfFileName,
            api_key=api_key
        )
        return {
            "success": True,
            "providerUsed": "python_pdf_engine",
            "data": res
        }

    raise HTTPException(status_code=400, detail=f"Unsupported action for Python backend: {action}")


def start_server(host: str = "127.0.0.1", port: int = 8000, reload: bool = False):
    """Start uvicorn server programmatically."""
    import uvicorn
    print("\n=======================================================")
    print(f"[*] Starting Python Math & Vision Backend on http://{host}:{port}")
    print(f"    SymPy Version: {sp.__version__}")
    print(f"    Python Version: {sys.version.split()[0]}")
    print("=======================================================\n")
    uvicorn.run("python_backend.api_server:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    start_server()
