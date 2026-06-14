import {
  ArrowDownRight,
  Check,
  MapPin,
  Navigation,
  Plane,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { MarketingLanguage } from "./Header";

export default function Hero({ lang = "en" }: { lang?: MarketingLanguage }) {
  const zh = lang === "zh";
  const readiness = [
    { label: zh ? "eSIM 已连接" : "eSIM connected", icon: Wifi },
    { label: zh ? "支付宝已验证" : "Alipay verified", icon: ShieldCheck },
    { label: zh ? "已保存酒店中文地址" : "Hotel saved in Chinese", icon: MapPin },
  ];
  const steps = zh
    ? [["01", "连接旅行 eSIM", "已就绪"], ["02", "打开支付宝并完成测试", "已验证"], ["03", "按指示前往网约车 P3 上车点", "12 分钟"], ["04", "向司机展示酒店地址卡", "已保存"]]
    : [["01", "Connect to your travel eSIM", "Ready"], ["02", "Open Alipay and run a test", "Verified"], ["03", "Follow signs to Didi pickup P3", "12 min"], ["04", "Show driver the hotel card", "Saved"]];
  return (
    <section className="hero-grid relative overflow-hidden border-b border-ink/10 bg-paper pt-24">
      <div className="mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-16 px-5 py-16 md:px-10 lg:grid-cols-[1.04fr_0.96fr] lg:px-16 lg:py-24">
        <div className="relative z-10 max-w-3xl">
          <div className="reveal-up mb-8 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cinnabar" />
            {zh ? "你在中国旅行时的本地智能层" : "Your local intelligence layer in China"}
          </div>

          <h1 className="reveal-up text-balance font-display text-[clamp(3.8rem,8vw,8.3rem)] font-black leading-[0.82] tracking-[-0.065em] text-ink [animation-delay:80ms]">
            {zh ? "在中国，" : "China,"}
            <span className="block text-cinnabar">{zh ? "带着上下文旅行。" : "with context."}</span>
          </h1>

          <p className="reveal-up mt-9 max-w-2xl text-lg leading-8 text-ink/65 md:text-xl [animation-delay:160ms]">
            {zh
              ? "从行前配置，到街头、车站和餐厅，再到某项服务突然失效时，它始终陪在身边，成为你的数字本地向导。"
              : "A digital local guide that stays with you from pre-flight setup to the street, the station, the restaurant, and the moment something stops working."}
          </p>

          <div className="reveal-up mt-10 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
              <a
                href="/app"
                className="group flex min-h-14 items-center justify-center gap-3 bg-ink px-7 text-sm font-bold text-white transition hover:bg-cinnabar"
              >
                {zh ? "打开应用原型" : "Open the app prototype"}
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
            </a>
            <a
              href="#journey"
              className="flex min-h-14 items-center justify-center border border-ink/25 bg-white/50 px-7 text-sm font-bold text-ink transition hover:border-ink hover:bg-white"
            >
              {zh ? "了解它如何一路陪伴" : "See how it travels with you"}
            </a>
          </div>

          <div className="reveal-up mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink/15 pt-6 text-xs font-semibold text-ink/55 [animation-delay:320ms]">
            {(zh
              ? ["无需每次重复背景", "离线备用方案", "需要时连接真人"]
              : ["No new context every chat", "Offline fallbacks", "Human help when it matters"]).map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cinnabar" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <div className="reveal-up relative mx-auto w-full max-w-[580px] [animation-delay:180ms]">
          <div className="absolute -left-10 top-8 hidden font-display text-[11rem] font-black leading-none text-ink/[0.035] lg:block">
            中
          </div>
          <div className="relative rotate-[1.5deg] border border-ink/15 bg-white p-3 shadow-[24px_28px_0_rgba(19,18,15,0.08)]">
            <div className="relative min-h-[590px] overflow-hidden bg-[#151713] p-6 text-white md:p-9">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:38px_38px]" />
              <div className="relative">
                <div className="flex items-start justify-between border-b border-white/15 pb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {zh ? "北京 · 当地时间 08:42" : "Beijing · 08:42 local"}
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold">{zh ? "抵达模式" : "Arrival mode"}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cinnabar">
                    <Plane className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-white/50">{zh ? "早上好，Alex。" : "Good morning, Alex."}</p>
                  <h2 className="mt-2 max-w-sm font-display text-4xl font-bold leading-tight tracking-tight">
                    {zh ? "你已落地，这是抵达后的第一小时。" : "You landed. Here's your first hour."}
                  </h2>
                </div>

                <div className="mt-8 space-y-2">
                  {steps.map(([number, label, status], index) => (
                    <div
                      key={number}
                      className={`grid grid-cols-[34px_1fr_auto] items-center gap-3 border p-4 ${
                        index < 2
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-[#e44e33]/40 bg-[#e44e33]/10"
                      }`}
                    >
                      <span className="font-mono text-xs text-white/35">{number}</span>
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#f29a86]">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-center gap-4 bg-[#f1dfbd] p-4 text-ink">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{zh ? "下一步最佳行动" : "Next best action"}</p>
                    <p className="mt-0.5 text-xs text-ink/60">
                      {zh ? "步行 180 米前往官方网约车上车区。" : "Walk 180m to the official ride-hailing zone."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-7 -left-5 hidden -rotate-2 border border-ink/15 bg-[#f1dfbd] p-5 shadow-lg md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/45">
              {zh ? "行前准备状态" : "Pre-flight status"}
            </p>
            <div className="mt-3 space-y-2">
              {readiness.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-bold text-ink">
                  <Icon className="h-3.5 w-3.5 text-cinnabar" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
