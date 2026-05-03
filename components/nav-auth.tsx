"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function NavAuth() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) {
    return (
      <div
        className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#e8eaf2]"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="shrink-0 border border-[#d9dce7] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#0f1222] hover:bg-[#f5f6fa]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
      <span className="hidden font-mono text-xs text-[#5c6178] sm:block">
        {user.name}
      </span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f1222] text-xs font-semibold text-white"
      >
        {user.name.trim().charAt(0).toUpperCase()}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-10 z-50 min-w-44 border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_30px_rgba(15,18,34,0.14)]"
        >
          <Link
            href="/my-skills"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-[#0f1222] hover:bg-[#f5f6fa]"
          >
            My skills set
          </Link>
          <Link
            href="/sell/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-[#0f1222] hover:bg-[#f5f6fa]"
          >
            Seller dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="block w-full px-3 py-2 text-left text-sm text-[#0f1222] hover:bg-[#f5f6fa]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
