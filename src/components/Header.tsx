"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "#journey", label: "How it works" },
  { href: "#agent", label: "Live agent" },
  { href: "#context", label: "Why context" },
  { href: "#services", label: "Local services" },
  { href: "#guides", label: "Local guides" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-3" aria-label="China Travel Agent home">
          <span className="flex h-9 w-9 items-center justify-center bg-cinnabar font-display text-lg font-black text-white">
            中
          </span>
          <span className="leading-none">
            <strong className="block font-display text-base tracking-tight text-ink">
              China Travel
            </strong>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-ink/45">
              Local Agent
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-4 md:flex lg:gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-bold text-ink/60 transition hover:text-cinnabar"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
            EN / 中文
          </span>
          <a
            href="#agent"
            className="bg-ink px-5 py-3 text-xs font-bold text-white transition hover:bg-cinnabar"
          >
            Try the agent
          </a>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-ink/15 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-ink/10 bg-paper px-5 py-6 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="border-b border-ink/10 py-4 font-display text-2xl font-bold text-ink"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#agent"
              onClick={() => setMenuOpen(false)}
              className="mt-5 bg-cinnabar px-5 py-4 text-center text-sm font-bold text-white"
            >
              Try the agent
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
