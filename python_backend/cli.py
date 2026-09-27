"""
Command Line Interface for STEM Intellect Python Math Engine
Usage:
    python -m python_backend.cli solve "2x^2 + 5x - 3 = 0"
    python -m python_backend.cli solve "integrate x*sin(x) dx"
    python -m python_backend.cli serve --port 8000
"""

import sys
import json
import argparse
from python_backend.math_solver import solve_general_math
from python_backend.api_server import start_server


def main():
    parser = argparse.ArgumentParser(description="STEM Intellect Python Math & Vision CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # solve command
    solve_parser = subparsers.add_parser("solve", help="Solve mathematical expression or derivation")
    solve_parser.add_argument("problem", type=str, help="Problem string to solve")
    solve_parser.add_argument("--json", action="store_true", help="Output full JSON result")

    # serve command
    serve_parser = subparsers.add_parser("serve", help="Start FastAPI math backend server")
    serve_parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface")
    serve_parser.add_argument("--port", type=int, default=8000, help="Port number")

    args = parser.parse_args()

    if args.command == "solve":
        res = solve_general_math(args.problem)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print(f"\n[Problem]: {res.get('problem')}")
            print(f"[Type]: {res.get('problemType')}")
            print(f"[LaTeX]: {res.get('latex')}")
            print(f"[Final Answer]: {res.get('finalAnswer')}")
            print("\n[Derivation Steps]:")
            for step in res.get("steps", []):
                print(f"  Step {step['stepNumber']}: {step['title']}")
                print(f"    Derivation: {step['derivation']}")
                print(f"    Note: {step['explanation']}")
            print(f"\n[Verification]: {res.get('verification')}\n")

    elif args.command == "serve":
        start_server(host=args.host, port=args.port)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
