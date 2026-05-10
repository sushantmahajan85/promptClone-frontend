// <OpenInCoworkButton
//   skillName="Content Writer"
//   skillPrompt="You are an expert content writer..."
// />

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_PROMPT_CHARS = 14_000;
const FALLBACK_DELAY_MS = 600;

export type OpenInCoworkButtonProps = Readonly<{
  skillPrompt: string;
  skillName: string;
  className?: string;
}>;

function ExternalLinkIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function OpenInCoworkButton({
  skillPrompt,
  skillName,
  className = "",
}: OpenInCoworkButtonProps) {
  const [showFallback, setShowFallback] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    setShowFallback(false);
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const truncated =
      skillPrompt.length > MAX_PROMPT_CHARS
        ? skillPrompt.slice(0, MAX_PROMPT_CHARS)
        : skillPrompt;
    const url = `claude://cowork/new?q=${encodeURIComponent(truncated)}`;
    window.location.href = url;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        setShowFallback(true);
      }
    }, FALLBACK_DELAY_MS);
  }, [skillPrompt]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={skillName}
        aria-label={`Open in Claude Cowork — ${skillName}`}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 border border-[#1e293b] bg-white py-3 text-xs font-semibold tracking-[0.12em] text-[#0f1222] transition-colors hover:bg-[#f8fafc] ${className}`}
      >
        <ExternalLinkIcon className="h-4 w-4 shrink-0 text-[#0f1222]" />
        Open in Claude Cowork
      </button>

      {showFallback ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] w-[min(100%-2rem,28rem)] -translate-x-1/2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-[0_10px_40px_rgba(15,18,34,0.15)]"
        >
          <p>
            Claude Desktop not detected — download it at{" "}
            <a
              href="https://claude.ai/download"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              claude.ai/download
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setShowFallback(false)}
            className="mt-2 text-xs font-medium text-amber-800 underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </>
  );
}

export default OpenInCoworkButton;
