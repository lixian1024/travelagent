import { ArrowUpRight } from "lucide-react";
import type { MarketingLanguage } from "./Header";

export default function Footer({ lang = "en" }: { lang?: MarketingLanguage }) {
  const zh = lang === "zh";
  return (
    <footer className="bg-ink px-5 py-12 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center bg-cinnabar font-display text-lg font-black">
                中
              </span>
              <span className="font-display text-xl font-bold">China Travel Agent</span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
              {zh
                ? "持续的旅行上下文、中国本地服务能力，以及在真正需要时出现的真人帮助。"
                : "Persistent travel context, local service intelligence, and a real person when the situation needs one."}
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-bold text-[#f1dfbd] hover:text-white"
          >
            {zh ? "返回顶部" : "Back to top"} <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} China Travel Agent</p>
          <div className="flex gap-6">
            <a href="#journey" className="hover:text-white">{zh ? "旅程" : "Journey"}</a>
            <a href="#context" className="hover:text-white">{zh ? "上下文" : "Context"}</a>
            <a href="#services" className="hover:text-white">{zh ? "能力" : "Capabilities"}</a>
            <a href="#guides" className="hover:text-white">{zh ? "真人向导" : "Local guides"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
