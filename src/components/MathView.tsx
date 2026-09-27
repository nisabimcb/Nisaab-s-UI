"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Clean up LaTeX string by removing extra quotes, dollar signs, and fixing common typos
 */
function cleanLatex(raw: string): string {
  if (!raw) return "";
  let s = raw.trim();
  // Strip outer dollar signs
  if (s.startsWith("$$") && s.endsWith("$$")) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("$") && s.endsWith("$")) {
    s = s.slice(1, -1).trim();
  }
  // Replace double backslashes with standard LaTeX line breaks if needed
  s = s.replace(/\\\\(?=[^a-zA-Z])/g, "\\\\ ");
  return s;
}

/**
 * Renders a mathematical equation using KaTeX (Textbook / Blackboard notation)
 */
export function MathView({ math, displayMode = true, className = "" }: MathViewProps) {
  const html = useMemo(() => {
    const cleaned = cleanLatex(math);
    if (!cleaned) return "";
    try {
      return katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
      return `<span class="font-serif italic">${cleaned}</span>`;
    }
  }, [math, displayMode]);

  return (
    <div
      className={`katex-math-wrapper ${displayMode ? "py-1.5 overflow-x-auto text-center" : "inline-block"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders mixed text with inline LaTeX formulas (e.g. "$x^2$", "$\\Delta$", "\\frac{a}{b}")
 */
export function MathText({ text, className = "" }: MathTextProps) {
  const renderedElements = useMemo(() => {
    if (!text) return null;

    // Pattern to detect $...$ or $$...$$
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Display math $$...$$
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const mathContent = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={idx}
              className="block my-1"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{part}</span>;
        }
      }

      // Inline math $...$
      if (part.startsWith("$") && part.endsWith("$")) {
        const mathContent = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={idx}
              className="inline-block mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{part}</span>;
        }
      }

      // If text contains bare LaTeX command like \Delta, \frac, \sqrt, \alpha, etc.
      if (/\\[a-zA-Z]+/.test(part) && !part.includes(" ")) {
        try {
          const html = katex.renderToString(part, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return (
            <span
              key={idx}
              className="inline-block mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{part}</span>;
        }
      }

      return <span key={idx}>{part}</span>;
    });
  }, [text]);

  return <span className={className}>{renderedElements}</span>;
}

export default MathView;
