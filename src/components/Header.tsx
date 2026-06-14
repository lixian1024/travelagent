"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type MarketingLanguage = "en" | "zh";

const copy = {
  en: {
    brand: "China Travel",
    subBrand: "Local Agent",
    nav: ["How it works", "Live agent", "Why context", "Local services", "Local guides"],
    open: "Open the app",
    menu: "Open menu",
    close: "Close menu",
  },
  zh: {
    brand: "中国旅行",
    subBrand: "数字本地向导",
    nav: ["如何工作", "实时 Agent", "上下文优势", "本地服务", "真人向导"],
    open: "打开应用",
    menu: "打开菜单",
    close: "关闭菜单",
  },
} satisfies Record<MarketingLanguage, Record<string, string | string[]>>;

const navHrefs = ["#journey", "#agent", "#context", "#services", "#guides"];

export default function Header({ lang = "en" }: { lang?: MarketingLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const text = copy[lang];
  const navLinks = navHrefs.map((href, index) => ({ href, label: text.nav[index] }));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-3" aria-label="China Travel Agent home">
          <span className="flex h-9 w-9 items-center justify-center bg-cinnabar font-display text-lg font-black text-white">
            中
          </span>
          <span className="leading-none">
            <strong className="block font-display text-base tracking-tight text-ink">
              {text.brand}
            </strong>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-ink/45">
              {text.subBrand}
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
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.16em]">
            <Link href="/" className={lang === "en" ? "text-cinnabar" : "text-ink/40 hover:text-ink"}>EN</Link>
            <span className="px-2 text-ink/25">/</span>
            <Link href="/zh" className={lang === "zh" ? "text-cinnabar" : "text-ink/40 hover:text-ink"}>中文</Link>
          </div>
          <a
            href="/app"
            className="bg-ink px-5 py-3 text-xs font-bold text-white transition hover:bg-cinnabar"
          >
            {text.open}
          </a>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-ink/15 md:hidden"
          aria-label={menuOpen ? text.close as string : text.menu as string}
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
            <div className="mt-5 flex border border-ink/15 p-1 text-center text-xs font-bold">
              <Link href="/" className={`flex-1 px-4 py-3 ${lang === "en" ? "bg-ink text-white" : "text-ink"}`}>EN</Link>
              <Link href="/zh" className={`flex-1 px-4 py-3 ${lang === "zh" ? "bg-ink text-white" : "text-ink"}`}>中文</Link>
            </div>
            <a
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="mt-5 bg-cinnabar px-5 py-4 text-center text-sm font-bold text-white"
            >
              {text.open}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
