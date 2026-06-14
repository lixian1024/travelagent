"use client";

import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Languages,
  MapPin,
  MessageCircle,
  Navigation,
  ScanLine,
  Sparkles,
  Utensils,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import type { MarketingLanguage } from "./Header";

type Mode = "nearby" | "menu" | "driver" | "fix";

const modesEn: {
  id: Mode;
  label: string;
  icon: typeof MapPin;
  eyebrow: string;
  title: string;
  question: string;
}[] = [
  {
    id: "nearby",
    label: "At a sight",
    icon: MapPin,
    eyebrow: "LOCATION AWARE · TEMPLE OF HEAVEN",
    title: "You are entering through the East Gate.",
    question: "What should I notice here?",
  },
  {
    id: "menu",
    label: "Scan a menu",
    icon: Utensils,
    eyebrow: "CAMERA · MENU MODE",
    title: "I found 6 dishes you can eat.",
    question: "What is safe and not too spicy?",
  },
  {
    id: "driver",
    label: "Show a driver",
    icon: Navigation,
    eyebrow: "TRIP CONTEXT · NEXT STOP",
    title: "Your hotel, in a format the driver can use.",
    question: "Take me back to my hotel.",
  },
  {
    id: "fix",
    label: "Fix a problem",
    icon: WifiOff,
    eyebrow: "DEVICE DIAGNOSTIC · ESIM",
    title: "Your eSIM is installed, but data roaming is off.",
    question: "Why did my internet stop working?",
  },
];

const modesZh: typeof modesEn = [
  { id: "nearby", label: "景点讲解", icon: MapPin, eyebrow: "位置感知 · 天坛", title: "你正从东门进入景区。", question: "这里有什么值得留意？" },
  { id: "menu", label: "扫描菜单", icon: Utensils, eyebrow: "相机 · 菜单模式", title: "我找到了 6 道适合你的菜。", question: "哪些安全而且不太辣？" },
  { id: "driver", label: "展示给司机", icon: Navigation, eyebrow: "旅行上下文 · 下一站", title: "这是司机可以直接使用的酒店信息。", question: "带我回酒店。" },
  { id: "fix", label: "解决问题", icon: WifiOff, eyebrow: "设备诊断 · ESIM", title: "eSIM 已安装，但数据漫游尚未开启。", question: "为什么我的网络突然断了？" },
];

function NearbyPanel({ zh }: { zh: boolean }) {
  return (
    <div className="space-y-3">
      <div className="relative h-44 overflow-hidden bg-[#d7d2bd]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(30deg,transparent_45%,#7d8b70_46%,#7d8b70_49%,transparent_50%),linear-gradient(150deg,transparent_45%,#7d8b70_46%,#7d8b70_49%,transparent_50%)] [background-size:70px_70px]" />
        <div className="absolute left-[42%] top-[45%] h-3 w-3 rounded-full bg-cinnabar ring-8 ring-cinnabar/20" />
        <div className="absolute bottom-3 left-3 bg-white px-3 py-2 text-[10px] font-bold text-ink shadow">
          {zh ? "距祈年殿 120 米" : "120m to Hall of Prayer"}
        </div>
      </div>
      <div className="border-l-2 border-cinnabar bg-white p-4">
        <p className="text-xs font-bold text-ink">{zh ? "进入前先抬头看看" : "Look up before you enter"}</p>
        <p className="mt-1 text-xs leading-5 text-ink/55">
          {zh ? "蓝色琉璃瓦象征天空。建筑不用一根钉子，圆形主体落在方形基座上，表达“天圆地方”。" : "The blue tiles symbolize heaven. The building uses no nails, and its circular form sits on a square base: heaven above earth."}
        </p>
      </div>
      <button className="flex w-full items-center justify-between bg-ink p-4 text-left text-xs font-bold text-white">
        {zh ? "开始 12 分钟语音导览" : "Start a 12-minute audio walk"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function MenuPanel({ zh }: { zh: boolean }) {
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden bg-[#f0e4ca] p-5">
        <ScanLine className="absolute right-3 top-3 h-5 w-5 text-cinnabar" />
        <p className="font-display text-lg font-bold text-ink">宫保鸡丁</p>
        <p className="mt-1 text-xs text-ink/45">Kung Pao chicken · ¥48</p>
        <div className="mt-4 flex gap-2">
          <span className="bg-white px-2 py-1 text-[9px] font-bold uppercase text-[#34735a]">
            {zh ? "不含贝类" : "No shellfish"}
          </span>
          <span className="bg-white px-2 py-1 text-[9px] font-bold uppercase text-cinnabar">
            {zh ? "中辣" : "Medium spicy"}
          </span>
          <span className="bg-white px-2 py-1 text-[9px] font-bold uppercase text-[#9a6b19]">
            {zh ? "含花生" : "Peanuts"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="border border-ink/15 bg-white p-3 text-left">
          <Languages className="h-4 w-4 text-cinnabar" />
          <span className="mt-2 block text-[11px] font-bold text-ink">{zh ? "解释配料" : "Explain ingredients"}</span>
        </button>
        <button className="border border-ink/15 bg-white p-3 text-left">
          <MessageCircle className="h-4 w-4 text-cinnabar" />
          <span className="mt-2 block text-[11px] font-bold text-ink">{zh ? "帮我点单" : "Help me order"}</span>
        </button>
      </div>
      <div className="bg-ink p-4 text-white">
        <p className="text-[10px] uppercase tracking-wider text-white/40">{zh ? "展示给服务员" : "Show the server"}</p>
        <p className="mt-2 font-display text-xl font-bold">请做微辣，不要花生。</p>
        <p className="mt-1 text-[10px] text-white/50">Mild spice, no peanuts please.</p>
      </div>
    </div>
  );
}

function DriverPanel({ zh }: { zh: boolean }) {
  return (
    <div className="space-y-3">
      <div className="bg-white p-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
          {zh ? "把这个页面展示给司机" : "Show this screen to your driver"}
        </p>
        <p className="mt-5 font-display text-3xl font-black leading-tight text-ink">
          请带我去北京璞瑄酒店
        </p>
        <p className="mt-4 text-sm font-bold text-cinnabar">
          北京市东城区王府井大街1号
        </p>
        <p className="mt-2 text-xs text-ink/45">The PuXuan Hotel and Spa</p>
      </div>
      <div className="flex items-center justify-between border border-ink/15 bg-[#f0e4ca] p-4">
        <div>
          <p className="text-xs font-bold text-ink">{zh ? "预计车程" : "Estimated drive"}</p>
          <p className="mt-1 text-[10px] text-ink/50">{zh ? "22 分钟 · 约 ¥34" : "22 min · approx. ¥34"}</p>
        </div>
        <Navigation className="h-5 w-5 text-cinnabar" />
      </div>
      <button className="w-full bg-cinnabar p-4 text-xs font-bold text-white">
        {zh ? "在滴滴中打开此目的地" : "Open this destination in Didi"}
      </button>
    </div>
  );
}

function FixPanel({ zh }: { zh: boolean }) {
  return (
    <div className="space-y-3">
      <div className="border border-cinnabar/30 bg-[#fff3ed] p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-cinnabar" />
          <div>
            <p className="text-xs font-bold text-ink">{zh ? "已找到可能原因" : "Likely cause found"}</p>
            <p className="mt-1 text-xs leading-5 text-ink/55">
              {zh ? "旅行 eSIM 已激活，但 iPhone 上这个号码的数据漫游处于关闭状态。" : "Your travel eSIM is active, but iPhone data roaming is disabled for this line."}
            </p>
          </div>
        </div>
      </div>
      {(zh ? [
        ["1", "打开“设置”→“蜂窝网络”"],
        ["2", "点击你的中国旅行 eSIM"],
        ["3", "打开“数据漫游”"],
      ] : [
        ["1", "Open Settings → Cellular"],
        ["2", "Tap your China travel eSIM"],
        ["3", "Turn Data Roaming on"],
      ]).map(([number, instruction]) => (
        <div key={number} className="flex items-center gap-3 bg-white p-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
            {number}
          </span>
          <span className="text-xs font-semibold text-ink">{instruction}</span>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-2 bg-ink p-4 text-xs font-bold text-white">
        <Check className="h-4 w-4" />
        {zh ? "已经修改，请再次测试" : "I've changed it, test again"}
      </button>
    </div>
  );
}

export default function AgentDemo({ lang = "en" }: { lang?: MarketingLanguage }) {
  const [activeMode, setActiveMode] = useState<Mode>("nearby");
  const zh = lang === "zh";
  const modes = zh ? modesZh : modesEn;
  const mode = modes.find((item) => item.id === activeMode) ?? modes[0];
  const panel = activeMode === "nearby"
    ? <NearbyPanel zh={zh} />
    : activeMode === "menu"
      ? <MenuPanel zh={zh} />
      : activeMode === "driver"
        ? <DriverPanel zh={zh} />
        : <FixPanel zh={zh} />;

  return (
    <section id="agent" className="scroll-mt-20 bg-[#dbe2d2] px-5 py-20 md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-kicker">{zh ? "实时产品演示 / 02" : "Live product demo / 02"}</p>
            <h2 className="mt-5 max-w-xl font-display text-5xl font-black leading-[0.95] tracking-[-0.045em] text-ink md:text-7xl">
              {zh ? "在你开口前，" : "The right mode,"}
              <span className="block text-cinnabar">{zh ? "进入正确模式。" : "before you ask."}</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-ink/60">
              {zh ? "Agent 知道你在哪里、今天有什么安排，以及哪些设置已经完成。选择一个场景，看看同一份旅行上下文如何转化成不同帮助。" : "The agent knows where you are, what today looks like, and what has already been configured. Choose a situation to see how the same trip context becomes different help."}
            </p>

            <div className="mt-9 grid grid-cols-2 gap-px overflow-hidden border border-ink/15 bg-ink/15">
              {modes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activeMode === id}
                  onClick={() => setActiveMode(id)}
                  className={`flex min-h-24 flex-col items-start justify-between p-4 text-left transition ${
                    activeMode === id
                      ? "bg-ink text-white"
                      : "bg-[#edf0e8] text-ink hover:bg-white"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeMode === id ? "text-[#f1dfbd]" : "text-cinnabar"}`} />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-4 -top-4 h-full w-full border border-ink/20 bg-transparent" />
            <div className="relative grid overflow-hidden border border-ink/20 bg-paper shadow-[18px_22px_0_rgba(19,18,15,0.12)] md:grid-cols-[1fr_330px]">
              <div className="min-h-[690px] border-b border-ink/15 p-5 md:border-b-0 md:border-r md:p-8">
                <div className="flex items-center justify-between border-b border-ink/15 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cinnabar text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">China Travel Agent</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#34735a]">
                        {zh ? "● 上下文已连接" : "● Context is live"}
                      </p>
                    </div>
                  </div>
                  <CircleUserRound className="h-6 w-6 text-ink/30" />
                </div>

                <div className="py-7">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
                    {mode.eyebrow}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-black leading-tight text-ink">
                    {mode.title}
                  </h3>
                  <div className="mt-6 ml-auto max-w-[86%] bg-[#e7e1d5] p-4 text-sm leading-6 text-ink">
                    {mode.question}
                  </div>
                </div>

                <div key={activeMode} className="agent-panel-in">
                  {panel}
                </div>
              </div>

              <aside className="bg-[#181a16] p-5 text-white md:p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                  {zh ? "当前旅行上下文" : "Active trip context"}
                </p>
                <div className="mt-5 border-b border-white/10 pb-5">
                  <p className="font-display text-xl font-bold">{zh ? "Alex 的北京行程" : "Alex's Beijing day"}</p>
                  <p className="mt-1 text-xs text-white/40">{zh ? "8 天中的第 2 天 · 独自旅行" : "Day 2 of 8 · Solo traveler"}</p>
                </div>
                <div className="mt-5 space-y-5">
                  {[
                    [zh ? "现在" : "Now", zh ? "天坛" : "Temple of Heaven", MapPin],
                    [zh ? "接下来" : "Next", zh ? "前门附近午餐" : "Lunch near Qianmen", Utensils],
                    [zh ? "手机" : "Phone", "iPhone 16 · Airalo", WifiOff],
                    [zh ? "需求" : "Needs", zh ? "不要花生 · 少辣" : "No peanuts · mild spice", AlertTriangle],
                  ].map(([label, value, Icon]) => {
                    const ContextIcon = Icon as typeof MapPin;
                    return (
                      <div key={label as string} className="grid grid-cols-[24px_1fr] gap-3">
                        <ContextIcon className="mt-0.5 h-4 w-4 text-[#f1dfbd]" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                            {label as string}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-white/75">
                            {value as string}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button className="mt-8 flex w-full items-center justify-between border border-white/15 p-4 text-left">
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-white/35">
                      {zh ? "相机已就绪" : "Camera ready"}
                    </span>
                    <span className="mt-1 block text-xs font-semibold">{zh ? "扫描你看到的内容" : "Scan what you see"}</span>
                  </span>
                  <Camera className="h-4 w-4 text-[#f1dfbd]" />
                </button>

                <button className="mt-2 flex w-full items-center justify-between bg-cinnabar p-4 text-left">
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-white/60">
                      {zh ? "情况比较复杂？" : "Complex situation?"}
                    </span>
                    <span className="mt-1 block text-xs font-bold">{zh ? "联系本地向导" : "Ask a local guide"}</span>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
