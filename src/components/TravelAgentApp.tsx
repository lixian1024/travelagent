"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  CloudOff,
  Compass,
  CreditCard,
  Download,
  Home,
  Languages,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Phone,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  TrainFront,
  UserRoundCheck,
  Utensils,
  WalletCards,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "today" | "agent" | "prepare" | "offline" | "me";
type AgentMode = "ask" | "menu" | "driver" | "problem";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "agent", label: "Agent", icon: Sparkles },
  { id: "prepare", label: "Prepare", icon: ShieldCheck },
  { id: "offline", label: "Offline", icon: CloudOff },
  { id: "me", label: "Me", icon: CircleUserRound },
];

const readinessItems = [
  { id: "internet", label: "Internet", detail: "eSIM tested on your phone", icon: Wifi },
  { id: "payment", label: "Payment", detail: "Alipay test completed", icon: WalletCards },
  { id: "maps", label: "Maps", detail: "Amap and offline area saved", icon: Map },
  { id: "rides", label: "Ride-hailing", detail: "Didi account needs a test", icon: Navigation },
  { id: "translate", label: "Translation", detail: "Chinese pack downloaded", icon: Languages },
];

const offlineCards = [
  { title: "Hotel address", subtitle: "北京璞瑄酒店", icon: MapPin, tone: "bg-[#f1dfbd]" },
  { title: "Dietary card", subtitle: "不要花生，微辣", icon: Utensils, tone: "bg-[#e8d4c7]" },
  { title: "Emergency help", subtitle: "Police · Medical · Embassy", icon: Phone, tone: "bg-[#dbe2d2]" },
  { title: "Train details", subtitle: "G5 · Beijing South → Shanghai", icon: TrainFront, tone: "bg-white" },
];

function AppHeader({
  online,
  onInstall,
  canInstall,
}: {
  online: boolean;
  onInstall: () => void;
  canInstall: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-cinnabar font-display text-lg font-black text-white">
            中
          </span>
          <div>
            <p className="font-display text-sm font-black leading-none text-ink">China Agent</p>
            <p className={`mt-1 text-[9px] font-bold uppercase tracking-[0.14em] ${online ? "text-[#34735a]" : "text-cinnabar"}`}>
              {online ? "● Context live" : "● Offline mode"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="flex h-9 items-center gap-2 border border-ink/15 bg-white px-3 text-[10px] font-bold text-ink"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
          )}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center border border-ink/15 bg-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cinnabar" />
          </button>
        </div>
      </div>
    </header>
  );
}

function TodayScreen({ openAgent, openOffline }: { openAgent: () => void; openOffline: () => void }) {
  return (
    <div className="screen-in space-y-5 pb-4">
      <section className="relative overflow-hidden bg-ink p-5 text-white">
        <div className="absolute -right-5 -top-14 font-display text-[9rem] font-black text-white/[0.04]">
          京
        </div>
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
            Tuesday · Beijing · Day 2 of 8
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">Good morning, Alex.</p>
              <h1 className="mt-2 font-display text-4xl font-black leading-[0.95] tracking-tight">
                Your Beijing day is on track.
              </h1>
            </div>
            <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cinnabar">
              18°
            </span>
          </div>
          <div className="mt-7 flex items-center gap-3 border-t border-white/15 pt-5">
            <MapPin className="h-4 w-4 text-[#f1dfbd]" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/35">You are near</p>
              <p className="mt-1 text-xs font-bold">The PuXuan Hotel · Wangfujing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-ink/15 bg-[#f1dfbd] p-5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/45">
            Next best action
          </p>
          <span className="text-[10px] font-bold text-cinnabar">Leave in 24 min</span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-black text-ink">
          Take the metro to the Temple of Heaven.
        </h2>
        <p className="mt-2 text-xs leading-5 text-ink/55">
          Line 5 avoids morning traffic. Enter from the East Gate for the route you saved.
        </p>
        <button
          type="button"
          onClick={openAgent}
          className="mt-5 flex w-full items-center justify-between bg-ink p-4 text-left text-xs font-bold text-white"
        >
          Guide me from here
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Today</p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">Your route</h2>
          </div>
          <button className="text-[10px] font-bold text-cinnabar">Edit plan</button>
        </div>
        <div className="border border-ink/15 bg-white">
          {[
            ["09:30", "Temple of Heaven", "East Gate · audio guide ready", Compass, true],
            ["12:30", "Lunch near Qianmen", "3 saved allergy-safe options", Utensils, false],
            ["15:30", "Forbidden City", "Passport and ticket required", Ticket, false],
            ["19:30", "Chaoyang Acrobatics", "Didi pickup card saved", Sparkles, false],
          ].map(([time, title, detail, Icon, active], index) => {
            const RouteIcon = Icon as typeof MapPin;
            return (
              <div
                key={title as string}
                className={`grid grid-cols-[48px_34px_1fr] gap-3 p-4 ${index !== 3 ? "border-b border-ink/10" : ""}`}
              >
                <span className="pt-1 font-mono text-[10px] font-bold text-ink/35">{time as string}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "bg-cinnabar text-white" : "bg-paper text-ink/45"}`}>
                  <RouteIcon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-ink">{title as string}</p>
                  <p className="mt-1 text-[10px] leading-4 text-ink/45">{detail as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={openOffline}
        className="flex w-full items-center justify-between border border-ink/15 bg-white p-4 text-left"
      >
        <span className="flex items-center gap-3">
          <CloudOff className="h-5 w-5 text-cinnabar" />
          <span>
            <span className="block text-xs font-bold text-ink">4 offline cards ready</span>
            <span className="mt-1 block text-[10px] text-ink/45">Available without internet</span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink/35" />
      </button>
    </div>
  );
}

function AgentScreen({ onGuide }: { onGuide: () => void }) {
  const [mode, setMode] = useState<AgentMode>("ask");
  const content = {
    ask: {
      title: "What do you need right now?",
      body: "I know you are near Wangfujing, heading to the Temple of Heaven, and need peanut-free food.",
    },
    menu: {
      title: "Point your camera at the menu.",
      body: "I will explain dishes, spice level, allergens, and prepare Chinese text for the server.",
    },
    driver: {
      title: "Your next destination is ready.",
      body: "I can show a large Chinese address or open the exact pickup point in Didi.",
    },
    problem: {
      title: "Let’s diagnose it step by step.",
      body: "Tell me what failed. I already know your phone, eSIM provider, payment setup, and current location.",
    },
  }[mode];

  return (
    <div className="screen-in flex min-h-[calc(100dvh-152px)] flex-col">
      <div className="relative overflow-hidden bg-ink p-5 text-white">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cinnabar/15 blur-3xl" />
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f1dfbd]">
            Live local agent
          </p>
          <h1 className="mt-3 font-display text-3xl font-black leading-tight">{content.title}</h1>
          <p className="mt-3 text-xs leading-5 text-white/55">{content.body}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 py-4">
        {[
          ["menu", "Scan a menu", Camera],
          ["driver", "Show a driver", Navigation],
          ["problem", "Fix a problem", AlertTriangle],
          ["ask", "Ask anything", MessageCircle],
        ].map(([id, label, Icon]) => {
          const ModeIcon = Icon as typeof Camera;
          return (
            <button
              key={id as string}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id as AgentMode)}
              className={`flex min-h-24 flex-col items-start justify-between border p-4 text-left ${
                mode === id
                  ? "border-cinnabar bg-cinnabar text-white"
                  : "border-ink/15 bg-white text-ink"
              }`}
            >
              <ModeIcon className="h-5 w-5" />
              <span className="text-xs font-bold">{label as string}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 border border-ink/15 bg-white p-4">
        {mode === "menu" ? (
          <div className="space-y-3">
            <div className="flex h-52 flex-col items-center justify-center border border-dashed border-ink/25 bg-paper">
              <ScanLine className="h-8 w-8 text-cinnabar" />
              <p className="mt-3 text-xs font-bold">Camera preview</p>
              <p className="mt-1 text-[10px] text-ink/40">Center one menu page in the frame</p>
            </div>
            <button className="flex w-full items-center justify-center gap-2 bg-ink p-4 text-xs font-bold text-white">
              <Camera className="h-4 w-4" />
              Scan menu
            </button>
          </div>
        ) : mode === "driver" ? (
          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink/35">Show your driver</p>
            <p className="mt-7 font-display text-3xl font-black leading-tight">请带我去天坛东门</p>
            <p className="mt-4 text-sm font-bold text-cinnabar">北京市东城区天坛东路甲1号</p>
            <p className="mt-2 text-[10px] text-ink/40">Temple of Heaven East Gate</p>
            <button className="mt-7 flex w-full items-center justify-center gap-2 bg-cinnabar p-4 text-xs font-bold text-white">
              <Navigation className="h-4 w-4" />
              Open in Didi
            </button>
          </div>
        ) : mode === "problem" ? (
          <div className="space-y-2">
            {[
              [WifiOff, "My internet stopped working"],
              [CreditCard, "Alipay payment was declined"],
              [TrainFront, "I cannot find my train entrance"],
              [QrCode, "This QR code does not work"],
            ].map(([Icon, label]) => {
              const ProblemIcon = Icon as typeof WifiOff;
              return (
                <button key={label as string} className="flex w-full items-center justify-between border border-ink/10 p-4 text-left">
                  <span className="flex items-center gap-3 text-xs font-bold">
                    <ProblemIcon className="h-4 w-4 text-cinnabar" />
                    {label as string}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink/30" />
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="bg-[#f1dfbd] p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink/40">Suggested now</p>
              <p className="mt-2 text-xs font-bold leading-5">“What should I notice at the Temple of Heaven?”</p>
            </div>
            <div className="mt-4 space-y-2">
              {["Where should I eat nearby?", "What does this sign mean?", "What should I do next?"].map((question) => (
                <button key={question} className="flex w-full items-center justify-between border border-ink/10 p-4 text-left text-xs font-semibold">
                  {question}
                  <ChevronRight className="h-4 w-4 text-ink/30" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="flex h-12 flex-1 items-center gap-3 border border-ink/15 bg-white px-4 text-left text-xs text-ink/40">
          Ask your agent...
        </button>
        <button aria-label="Use microphone" className="flex h-12 w-12 items-center justify-center bg-ink text-white">
          <Mic className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onGuide}
        className="mt-3 flex w-full items-center justify-between bg-[#dbe2d2] p-4 text-left"
      >
        <span className="flex items-center gap-3">
          <UserRoundCheck className="h-5 w-5 text-[#34735a]" />
          <span>
            <span className="block text-xs font-bold">Need a local person?</span>
            <span className="mt-1 block text-[10px] text-ink/45">Find an English guide with your context</span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PrepareScreen() {
  const [checked, setChecked] = useState(["internet", "payment", "maps", "translate"]);
  const progress = Math.round((checked.length / readinessItems.length) * 100);

  return (
    <div className="screen-in space-y-5">
      <section className="bg-ink p-5 text-white">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f1dfbd]">Before you fly</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-5xl font-black">{progress}%</p>
            <p className="mt-2 text-xs text-white/50">4 days until departure</p>
          </div>
          <ShieldCheck className="h-10 w-10 text-[#f1dfbd]" />
        </div>
        <div className="mt-5 h-1.5 bg-white/10">
          <div className="h-full bg-cinnabar transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">System checks</p>
        <h1 className="mt-1 font-display text-3xl font-black text-ink">Make landing work.</h1>
        <div className="mt-4 border border-ink/15 bg-white">
          {readinessItems.map(({ id, label, detail, icon: Icon }, index) => {
            const done = checked.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setChecked((current) =>
                    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
                  )
                }
                className={`grid w-full grid-cols-[38px_1fr_28px] items-center gap-3 p-4 text-left ${index !== readinessItems.length - 1 ? "border-b border-ink/10" : ""}`}
              >
                <span className="flex h-9 w-9 items-center justify-center bg-paper">
                  <Icon className="h-4 w-4 text-cinnabar" />
                </span>
                <span>
                  <span className="block text-xs font-bold">{label}</span>
                  <span className="mt-1 block text-[10px] text-ink/45">{detail}</span>
                </span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${done ? "border-[#34735a] bg-[#34735a] text-white" : "border-ink/20"}`}>
                  {done && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border border-cinnabar/30 bg-[#fff3ed] p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">One action left</p>
        <h2 className="mt-3 font-display text-xl font-black">Test a real Didi destination.</h2>
        <p className="mt-2 text-xs leading-5 text-ink/50">
          Confirm your phone number, payment method, and English interface before departure.
        </p>
        <button className="mt-4 flex w-full items-center justify-between bg-cinnabar p-4 text-xs font-bold text-white">
          Start guided test
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section className="bg-[#f1dfbd] p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Arrival playbook</p>
        <h2 className="mt-3 font-display text-xl font-black">Your first hour at PEK</h2>
        <p className="mt-2 text-xs leading-5 text-ink/50">
          A step-by-step flow from airplane mode to your hotel pickup point.
        </p>
        <button className="mt-4 text-xs font-bold text-cinnabar">Preview 7 steps →</button>
      </section>
    </div>
  );
}

function OfflineScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const card = offlineCards.find((item) => item.title === selected);

  if (card) {
    const CardIcon = card.icon;
    return (
      <div className="screen-in min-h-[calc(100dvh-152px)]">
        <button onClick={() => setSelected(null)} className="mb-5 flex items-center gap-2 text-xs font-bold">
          <ArrowLeft className="h-4 w-4" />
          All offline cards
        </button>
        <div className={`${card.tone} flex min-h-[520px] flex-col border border-ink/15 p-6`}>
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
              <CardIcon className="h-5 w-5" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35">Saved offline</span>
          </div>
          <div className="my-auto text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">{card.title}</p>
            <p className="mt-6 font-display text-4xl font-black leading-tight text-ink">{card.subtitle}</p>
            <p className="mt-5 text-sm leading-6 text-ink/55">
              {card.title === "Hotel address"
                ? "北京市东城区王府井大街1号 · The PuXuan Hotel and Spa"
                : "Keep this screen open and show it to the person helping you."}
            </p>
          </div>
          <div className="border-t border-ink/15 pt-5 text-center text-[10px] font-semibold text-ink/40">
            China Travel Agent · Alex&apos;s trip
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-in space-y-5">
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">No signal required</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-none text-ink">Your offline pack.</h1>
        <p className="mt-3 text-xs leading-5 text-ink/50">
          Critical details stay readable when roaming, Wi-Fi, or your apps fail.
        </p>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {offlineCards.map(({ title, subtitle, icon: Icon, tone }) => (
          <button
            key={title}
            type="button"
            onClick={() => setSelected(title)}
            className={`${tone} flex min-h-44 flex-col items-start border border-ink/15 p-4 text-left`}
          >
            <Icon className="h-5 w-5 text-cinnabar" />
            <span className="mt-auto block text-xs font-bold text-ink">{title}</span>
            <span className="mt-1 block text-[10px] leading-4 text-ink/45">{subtitle}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 border border-[#34735a]/25 bg-[#edf5ef] p-4">
        <Check className="h-5 w-5 text-[#34735a]" />
        <div>
          <p className="text-xs font-bold">Offline pack is up to date</p>
          <p className="mt-1 text-[10px] text-ink/45">Last synced today at 08:12</p>
        </div>
      </div>
    </div>
  );
}

function MeScreen({
  authConfigured,
  user,
  signingOut,
  onSignOut,
}: {
  authConfigured: boolean;
  user: AuthUser | null;
  signingOut: boolean;
  onSignOut: () => void;
}) {
  const displayName = user?.name || "Prototype Traveler";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="screen-in space-y-5">
      <section className="flex items-center gap-4 bg-ink p-5 text-white">
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cinnabar font-display text-xl font-black">
            {initial}
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-black">{displayName}</h1>
          <p className="mt-1 text-[10px] text-white/45">
            {user?.email || "Beijing → Shanghai · Jun 17–24"}
          </p>
          {user?.provider && (
            <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#f1dfbd]">
              Signed in with {user.provider === "facebook" ? "Meta" : user.provider}
            </p>
          )}
        </div>
      </section>
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Trip context</p>
        <div className="mt-3 border border-ink/15 bg-white">
          {[
            [Smartphone, "Device & network", "iPhone 16 · Airalo eSIM"],
            [WalletCards, "Payment", "Alipay · Visa ending 2048"],
            [Utensils, "Food needs", "Peanut allergy · mild spice"],
            [MapPin, "Current city", "Beijing · Day 2"],
          ].map(([Icon, label, value], index) => {
            const ItemIcon = Icon as typeof Smartphone;
            return (
              <button key={label as string} className={`flex w-full items-center justify-between p-4 text-left ${index !== 3 ? "border-b border-ink/10" : ""}`}>
                <span className="flex items-center gap-3">
                  <ItemIcon className="h-4 w-4 text-cinnabar" />
                  <span>
                    <span className="block text-xs font-bold">{label as string}</span>
                    <span className="mt-1 block text-[10px] text-ink/45">{value as string}</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-ink/25" />
              </button>
            );
          })}
        </div>
      </section>
      <section>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Privacy & permissions</p>
        <div className="mt-3 space-y-2">
          {[
            [MapPin, "Location while using", "On"],
            [Camera, "Camera for visual help", "On"],
            [Bell, "Trip reminders", "On"],
          ].map(([Icon, label, status]) => {
            const PermissionIcon = Icon as typeof Camera;
            return (
              <div key={label as string} className="flex items-center justify-between border border-ink/15 bg-white p-4">
                <span className="flex items-center gap-3 text-xs font-bold">
                  <PermissionIcon className="h-4 w-4 text-cinnabar" />
                  {label as string}
                </span>
                <span className="text-[10px] font-bold text-[#34735a]">{status as string}</span>
              </div>
            );
          })}
        </div>
      </section>
      <Link href="/" className="flex items-center justify-between border border-ink/15 bg-paper p-4 text-xs font-bold">
        About China Travel Agent
        <ArrowRight className="h-4 w-4" />
      </Link>
      {authConfigured && (
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-between border border-cinnabar/25 bg-[#fff3ed] p-4 text-left text-xs font-bold text-cinnabar disabled:opacity-50"
        >
          {signingOut ? "Signing out..." : "Sign out"}
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function GuideSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="guide-sheet-title">
      <button aria-label="Close guide matcher" className="absolute inset-0" onClick={onClose} />
      <div className="sheet-in relative w-full max-w-md rounded-t-[28px] bg-paper p-5 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">Human handoff</p>
            <h2 id="guide-sheet-title" className="mt-2 font-display text-3xl font-black">A local guide fits this better.</h2>
          </div>
          <button aria-label="Close" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/15">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-ink/50">
          For tomorrow&apos;s Forbidden City visit, a guide can adapt the history and route to your pace.
        </p>
        <div className="mt-5 flex items-center gap-4 border border-ink/15 bg-white p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe2d2] font-display text-lg font-black">LW</span>
          <div className="flex-1">
            <p className="text-xs font-bold">Li Wei · Beijing</p>
            <p className="mt-1 text-[10px] text-ink/45">English · History · Family friendly</p>
            <p className="mt-2 text-[10px] font-bold text-[#34735a]">★ 4.9 · Available tomorrow 09:00</p>
          </div>
        </div>
        <button className="mt-4 flex w-full items-center justify-between bg-ink p-4 text-xs font-bold text-white">
          See 3 matched guides
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-center text-[9px] leading-4 text-ink/35">
          Your itinerary and needs are shared only after you approve.
        </p>
      </div>
    </div>
  );
}

export default function TravelAgentApp({
  authConfigured,
  user,
}: {
  authConfigured: boolean;
  user: AuthUser | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [online, setOnline] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstall);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  async function signOut() {
    if (!authConfigured) return;
    setSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  const screen = (() => {
    if (activeTab === "agent") return <AgentScreen onGuide={() => setGuideOpen(true)} />;
    if (activeTab === "prepare") return <PrepareScreen />;
    if (activeTab === "offline") return <OfflineScreen />;
    if (activeTab === "me") {
      return (
        <MeScreen
          authConfigured={authConfigured}
          user={user}
          signingOut={signingOut}
          onSignOut={signOut}
        />
      );
    }
    return (
      <TodayScreen
        openAgent={() => setActiveTab("agent")}
        openOffline={() => setActiveTab("offline")}
      />
    );
  })();

  return (
    <div className="min-h-dvh bg-[#e7e2d8]">
      <div className="mx-auto min-h-dvh max-w-md bg-paper shadow-[0_0_80px_rgba(19,18,15,0.12)]">
        <AppHeader online={online} onInstall={installApp} canInstall={Boolean(installPrompt)} />

        <main className="px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-4">
          {!authConfigured && (
            <div className="mb-4 border border-[#b98b34]/30 bg-[#fff8e8] p-3 text-[10px] leading-4 text-ink/60">
              <span className="font-bold text-ink">Prototype mode.</span> Add Supabase environment
              variables to enable Google and Meta sign-in.
            </div>
          )}
          {screen}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-ink/10 bg-paper/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl" aria-label="App navigation">
          <div className="grid grid-cols-5">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveTab(id)}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1.5 ${
                    active ? "text-cinnabar" : "text-ink/40"
                  }`}
                >
                  <span className={`relative flex h-6 w-9 items-center justify-center ${active ? "bg-cinnabar/10" : ""}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span className="text-[9px] font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {guideOpen && <GuideSheet onClose={() => setGuideOpen(false)} />}
      </div>
    </div>
  );
}
