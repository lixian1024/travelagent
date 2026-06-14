import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  CircleUserRound,
  Clock3,
  Compass,
  HeartHandshake,
  Languages,
  MapPin,
  Navigation,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRoundCheck,
  Utensils,
  WalletCards,
  Wifi,
} from "lucide-react";
import type { MarketingLanguage } from "./Header";

const stagesEn = [
  {
    number: "01",
    label: "Before China",
    title: "Make sure landing works.",
    description:
      "Not a checklist you hope is right. The agent guides setup, asks you to test it, and builds an arrival plan around the systems you actually use.",
    color: "bg-[#f0e4ca]",
    icon: ShieldCheck,
    items: [
      "Verify eSIM, payment, maps, Didi and translation",
      "Run real setup tests before departure",
      "Generate a first-hour arrival flow",
      "Save addresses and backups offline",
    ],
  },
  {
    number: "02",
    label: "Inside China",
    title: "Understand what is happening now.",
    description:
      "Location, camera and itinerary turn a generic assistant into practical local intelligence at the exact moment it is needed.",
    color: "bg-[#dbe2d2]",
    icon: Compass,
    items: [
      "Enter guide mode when you reach a sight",
      "Scan menus, signs, tickets and station entrances",
      "Explain payment failures and lost connectivity",
      "Answer: what should I do next?",
    ],
  },
  {
    number: "03",
    label: "When AI is not enough",
    title: "Bring in the right local person.",
    description:
      "Deep interpretation, complex routing, family care and disruption deserve a human. The handoff includes the context, so nobody starts from zero.",
    color: "bg-[#e8d4c7]",
    icon: HeartHandshake,
    items: [
      "Recommend help only when the situation calls for it",
      "Match language, city, interests and availability",
      "Pass itinerary and needs with permission",
      "Book a guide for tomorrow or ask for urgent help",
    ],
  },
];

const contextSignalsEn = [
  { label: "Current location", value: "East Gate, Temple of Heaven", icon: MapPin },
  { label: "Today", value: "Temple → Qianmen → Acrobatics", icon: Navigation },
  { label: "Travel setup", value: "iPhone · eSIM · Alipay", icon: Smartphone },
  { label: "Personal needs", value: "Peanut allergy · low spice", icon: Utensils },
  { label: "Verified before flight", value: "4 of 5 systems tested", icon: ShieldCheck },
  { label: "Local service layer", value: "Tickets · transit · guides", icon: UserRoundCheck },
];

const stagesZh = [
  {
    number: "01",
    label: "抵达中国前",
    title: "确保落地后真的能用。",
    description: "这不是一张只能祈祷无误的清单。Agent 会引导配置、要求实际验证，并根据你真正使用的系统生成抵达方案。",
    color: "bg-[#f0e4ca]",
    icon: ShieldCheck,
    items: ["验证 eSIM、支付、地图、滴滴和翻译", "出发前完成真实配置测试", "生成抵达后的第一小时流程", "离线保存地址和备用方案"],
  },
  {
    number: "02",
    label: "在中国旅行中",
    title: "理解此刻正在发生什么。",
    description: "位置、相机和行程让通用助手变成实用的本地智能，并在最需要的那一刻提供帮助。",
    color: "bg-[#dbe2d2]",
    icon: Compass,
    items: ["抵达景点后进入讲解模式", "扫描菜单、路牌、票据和车站入口", "分析支付失败和网络中断", "回答：我接下来该做什么？"],
  },
  {
    number: "03",
    label: "当 AI 不够时",
    title: "连接最合适的本地人。",
    description: "深度讲解、复杂路线、家庭照顾和突发状况值得真人处理。交接时会带上上下文，不必从零开始。",
    color: "bg-[#e8d4c7]",
    icon: HeartHandshake,
    items: ["仅在情况需要时推荐真人帮助", "按语言、城市、兴趣和时间匹配", "经许可后传递行程与需求", "预约次日导游或请求紧急帮助"],
  },
];

const contextSignalsZh = [
  { label: "当前位置", value: "天坛东门", icon: MapPin },
  { label: "今日行程", value: "天坛 → 前门 → 杂技演出", icon: Navigation },
  { label: "旅行配置", value: "iPhone · eSIM · 支付宝", icon: Smartphone },
  { label: "个人需求", value: "花生过敏 · 少辣", icon: Utensils },
  { label: "行前验证", value: "5 项系统中已测试 4 项", icon: ShieldCheck },
  { label: "本地服务层", value: "门票 · 交通 · 导游", icon: UserRoundCheck },
];

export function JourneySection({ lang = "en" }: { lang?: MarketingLanguage }) {
  const zh = lang === "zh";
  const stages = zh ? stagesZh : stagesEn;
  return (
    <section id="journey" className="scroll-mt-20 bg-paper px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-b border-ink/15 pb-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="section-kicker">{zh ? "一段持续的旅程 / 01" : "One continuous journey / 01"}</p>
            <h2 className="max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.045em] text-ink md:text-7xl">
              {zh ? "从“能不能用？”走到" : "From “will it work?” to"}
              <span className="text-cinnabar">{zh ? "“现在该做什么？”" : " “what now?”"}</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {stages.map(({ number, label, title, description, color, icon: Icon, items }) => (
              <article
                key={number}
                className={`${color} group flex min-h-[590px] flex-col border border-ink/15 p-6 transition-transform duration-300 hover:-translate-y-2 md:p-8`}
              >
                <div className="flex items-center justify-between border-b border-ink/15 pb-5">
                  <span className="font-mono text-xs font-bold text-ink/40">{number}</span>
                  <Icon className="h-6 w-6 text-cinnabar" />
                </div>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-cinnabar">
                  {label}
                </p>
                <h3 className="mt-3 font-display text-4xl font-black leading-[1.02] tracking-tight text-ink">
                  {title}
                </h3>
                <p className="mt-5 text-sm leading-6 text-ink/60">{description}</p>
                <div className="mt-auto space-y-3 pt-10">
                  {items.map((item) => (
                    <div key={item} className="flex gap-3 border-t border-ink/10 pt-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar" />
                      <span className="text-xs font-semibold leading-5 text-ink/75">{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
    </section>
  );
}

export function ContextAndServicesSection({ lang = "en" }: { lang?: MarketingLanguage }) {
  const zh = lang === "zh";
  const contextSignals = zh ? contextSignalsZh : contextSignalsEn;
  return (
    <>
      <section id="context" className="scroll-mt-20 overflow-hidden bg-ink px-5 py-20 text-white md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-kicker !text-[#f1dfbd]">{zh ? "上下文优势 / 03" : "The context advantage / 03"}</p>
              <h2 className="mt-6 max-w-3xl font-display text-5xl font-black leading-[0.94] tracking-[-0.045em] md:text-7xl">
                {zh ? "翻译只是一项功能。" : "Translation is a feature."}
                <span className="block text-[#f1dfbd]">{zh ? "记忆才是产品。" : "Memory is the product."}</span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/55">
                {zh
                  ? "通用模型可以解释菜单。你的旅行 Agent 还知道它是否符合你的过敏要求、时间安排和预算，以及你是否要在九十分钟后赶火车。"
                  : "A general model can explain a menu. Your travel agent knows whether that menu fits your allergy, your schedule, your budget, and the train you need to catch in ninety minutes."}
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  [Camera, zh ? "你看到了什么" : "What you see"],
                  [MapPin, zh ? "你在哪里" : "Where you are"],
                  [Clock3, zh ? "下一步是什么" : "What comes next"],
                  [CircleUserRound, zh ? "和谁一起旅行" : "Who you travel with"],
                ].map(([Icon, label]) => {
                  const SignalIcon = Icon as typeof Camera;
                  return (
                    <div key={label as string} className="border border-white/15 p-4">
                      <SignalIcon className="h-5 w-5 text-[#f1dfbd]" />
                      <p className="mt-5 text-xs font-bold">{label as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-20 -top-24 font-display text-[18rem] font-black leading-none text-white/[0.025]">
                境
              </div>
              <div className="relative border border-white/15 bg-white/[0.04] p-5 md:p-8">
                <div className="flex items-center justify-between border-b border-white/15 pb-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                      {zh ? "持续旅行图谱" : "Persistent trip graph"}
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold">{zh ? "是上下文，不只是聊天记录" : "Context, not chat history"}</p>
                  </div>
                  <Bot className="h-7 w-7 text-[#f1dfbd]" />
                </div>
                <div className="mt-5 grid gap-px bg-white/10 sm:grid-cols-2">
                  {contextSignals.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-[#181a16] p-5">
                      <Icon className="h-4 w-4 text-[#f1dfbd]" />
                      <p className="mt-5 text-[9px] font-bold uppercase tracking-wider text-white/30">
                        {label}
                      </p>
                      <p className="mt-2 text-xs font-semibold leading-5 text-white/75">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-l-2 border-cinnabar bg-cinnabar/10 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#f29a86]">
                    {zh ? "Agent 推理" : "Agent inference"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {zh
                      ? "请在 14:10 前结束午餐。走南门可以节省 18 分钟，并在 15:30 的预约前避开台阶。"
                      : "Leave lunch by 14:10. The south entrance saves 18 minutes and avoids stairs before your 15:30 booking."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-20 bg-paper px-5 py-20 md:px-10 md:py-28 lg:px-16"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="section-kicker">{zh ? "中国本地能力 / 04" : "China-ready capabilities / 04"}</p>
              <h2 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-[-0.045em] text-ink md:text-6xl">
                {zh ? "一个 Agent，连接你在中国真正使用的系统。" : "One agent for the systems you actually use in China."}
              </h2>
              <p className="mt-6 text-base leading-7 text-ink/60">
                {zh
                  ? "这是 Agent 的本地行动层：从诊断支付宝与 eSIM 问题，到在滴滴中打开目的地或匹配认证导游，每个回答背后都有可执行的能力。"
                  : "This is the agent's local action layer: the practical capabilities behind each answer, from diagnosing Alipay and eSIM issues to opening a destination in Didi or matching a verified guide."}
              </p>
            </div>
            <div className="grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [WalletCards, zh ? "支付" : "Payment", zh ? "二维码类型、银行卡绑定、现金备用" : "QR type, card linkage, fallback cash"],
                [Wifi, zh ? "网络" : "Connectivity", zh ? "eSIM、漫游与网络诊断" : "eSIM, roaming, network diagnostics"],
                [Navigation, zh ? "出行" : "Mobility", zh ? "滴滴上车点、地铁与火车站" : "Didi pickup, metro, train stations"],
                [Languages, zh ? "语言" : "Language", zh ? "菜单、路牌、给司机看的中文" : "Menus, signs, driver-ready Chinese"],
                [ScanLine, zh ? "视觉" : "Vision", zh ? "票据、入口、路牌与收据" : "Tickets, entrances, road signs, receipts"],
                [UserRoundCheck, zh ? "真人" : "People", zh ? "认证导游与紧急本地帮助" : "Verified guides and urgent local help"],
              ].map(([Icon, title, copy]) => {
                const ServiceIcon = Icon as typeof Wifi;
                return (
                  <article key={title as string} className="min-h-48 bg-white p-6">
                    <ServiceIcon className="h-6 w-6 text-cinnabar" />
                    <h3 className="mt-8 font-display text-xl font-bold text-ink">{title as string}</h3>
                    <p className="mt-2 text-xs leading-5 text-ink/50">{copy as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function HumanGuideSection({ lang = "en" }: { lang?: MarketingLanguage }) {
  const zh = lang === "zh";
  return (
    <section id="guides" className="scroll-mt-20 bg-[#e44e33] px-5 py-20 text-white md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="section-kicker !text-white/60">{zh ? "真人接力 / 05" : "Human handoff / 05"}</p>
          <h2 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[0.93] tracking-[-0.045em] md:text-7xl">
            {zh ? "有些时刻需要本地人，而不是更长的提示词。" : "Some moments need a local, not a longer prompt."}
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/70">
            {zh
              ? "当 Agent 识别到深度讲解、复杂路线、家庭照顾或突发状况时，会在旅行者许可下带着上下文，把需求转交给合适的真人向导。"
              : "When the agent detects deep interpretation, complex logistics, family care or disruption, it turns intent into a qualified guide lead, with the traveler's permission and context attached."}
          </p>
        </div>

        <div className="border border-white/25 bg-[#f5e7d0] p-5 text-ink shadow-[18px_22px_0_rgba(19,18,15,0.18)] md:p-8">
          <div className="flex items-start justify-between border-b border-ink/15 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold">{zh ? "Agent 建议" : "Agent recommendation"}</p>
                <p className="mt-1 text-[10px] font-semibold text-ink/45">{zh ? "根据明日行程生成" : "Based on tomorrow's plan"}</p>
              </div>
            </div>
            <span className="bg-[#dbe2d2] px-2 py-1 text-[9px] font-bold uppercase text-[#34735a]">
              {zh ? "匹配度高" : "Good match"}
            </span>
          </div>

          <p className="mt-7 font-display text-2xl font-bold leading-snug">
            {zh
              ? "“这个问题更适合本地人处理。需要为明天的故宫行程预约一位英文导游吗？”"
              : "“This question is better handled by a local. Would you like an English guide for the Forbidden City tomorrow?”"}
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            <div className="border border-ink/15 bg-white p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink/35">{zh ? "匹配需求" : "Matched for"}</p>
              <p className="mt-2 text-xs font-bold">{zh ? "历史讲解 · 慢步行节奏" : "History · low walking pace"}</p>
            </div>
            <div className="border border-ink/15 bg-white p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink/35">{zh ? "可预约时间" : "Available"}</p>
              <p className="mt-2 text-xs font-bold">{zh ? "明天 · 09:00 · 4 小时" : "Tomorrow · 09:00 · 4 hours"}</p>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-between bg-ink p-4 text-left text-xs font-bold text-white transition hover:bg-[#34342f]">
            {zh ? "查看 3 位匹配的本地向导" : "See 3 matched local guides"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-center text-[10px] leading-4 text-ink/40">
            {zh ? "只有在你确认后，才会分享行程与无障碍偏好。" : "Your itinerary and accessibility preferences are only shared after approval."}
          </p>
        </div>
      </div>
    </section>
  );
}
