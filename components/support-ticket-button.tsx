"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function SupportTicketButton({
  className,
}: Readonly<{ className?: string }>) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      dialog.close();
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    setStatus("idle");
    setDescription("");
    setEmail("");
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) return;
    setStatus("submitting");
    try {
      // Opens the user's mail client with the ticket pre-filled as a fallback.
      // Replace this with a real API call when a ticketing endpoint is available.
      const subject = encodeURIComponent("Support Request — SkillKart");
      const body = encodeURIComponent(
        `From: ${email || "not provided"}\n\n${description.trim()}`,
      );
      globalThis.location.href = `mailto:support@myskillkart.com?subject=${subject}&body=${body}`;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "text-sm text-[#5c6178] hover:text-[#0f1222]"}
      >
        Get support
      </button>

      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
        onClose={close}
        className="fixed inset-0 m-auto w-full max-w-md rounded-2xl border border-[#e4e8f4] bg-white p-0 shadow-[0_24px_60px_rgba(15,18,34,0.18)] backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
              ✅
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#0f1222]">Ticket raised!</h2>
              <p className="mt-1.5 text-sm text-[#6b728e]">
                Your mail client should have opened with the details pre-filled.
                We aim to respond within 1 business day.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="mt-2 rounded-xl border border-[#e4e8f4] px-6 py-2.5 text-sm font-semibold text-[#0f1222] transition-colors hover:bg-[#f5f6fa]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#f0f2f8] px-6 py-5">
              <div>
                <h2
                  id="support-dialog-title"
                  className="text-base font-semibold text-[#0f1222]"
                >
                  Raise a support ticket
                </h2>
                <p className="mt-0.5 text-xs text-[#7a8099]">
                  We&apos;ll get back to you at{" "}
                  <span className="font-medium text-[#0f1222]">support@myskillkart.com</span>
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="ml-4 mt-0.5 rounded-lg p-1.5 text-[#9aa0b5] transition-colors hover:bg-[#f5f6fa] hover:text-[#0f1222]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="support-email" className="mb-1.5 block text-xs font-semibold text-[#4a5068]">
                  Your email <span className="font-normal text-[#9aa0b5]">(optional)</span>
                </label>
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#e4e8f4] bg-[#f8f9fc] px-3.5 py-2.5 text-sm text-[#0f1222] outline-none placeholder:text-[#aab0c8] focus:border-[#2563eb]/50 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/10"
                />
              </div>

              <div>
                <label htmlFor="support-desc" className="mb-1.5 block text-xs font-semibold text-[#4a5068]">
                  Describe your issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  id="support-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  placeholder="Tell us what's happening — include your order ID or skill name if relevant…"
                  className="w-full resize-none rounded-xl border border-[#e4e8f4] bg-[#f8f9fc] px-3.5 py-2.5 text-sm text-[#0f1222] outline-none placeholder:text-[#aab0c8] focus:border-[#2563eb]/50 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/10"
                />
                <p className="mt-1 text-right text-[10px] text-[#aab0c8]">
                  {description.length} / 1000
                </p>
              </div>

              {status === "error" ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  Something went wrong. Please email us directly at support@myskillkart.com.
                </p>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-[#f0f2f8] px-6 py-4">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-[#e4e8f4] px-4 py-2 text-sm font-medium text-[#5c6178] transition-colors hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!description.trim() || status === "submitting"}
                className="rounded-xl bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Raise ticket"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
