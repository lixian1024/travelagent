"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CircleUserRound,
  CloudOff,
  Download,
  Home,
  Languages,
  LogOut,
  Map,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  PlaneLanding,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Trash2,
  TrainFront,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AgentChat from "@/components/AgentChat";
import TodayDashboard from "@/components/TodayDashboard";
import {
  createOfflineCard,
  deleteOfflineCard,
  getOfflineCards,
  saveOfflineCard,
  type OfflineCard,
  type OfflineCardType,
} from "@/lib/offline-cards";

type Tab = "today" | "agent" | "prepare" | "offline" | "me";
type PlaybookResult = "passed" | "failed";

type TripContext = {
  device: string;
  network: string;
  paymentMethods: string[];
  foodNeeds: string[];
  spiceLevel: string;
  tripDays: number;
  travelerCount: number;
  cities: string[];
};

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
  { id: "prepare", label: "Prepare", icon: ShieldCheck },
  { id: "agent", label: "Agent", icon: Sparkles },
  { id: "today", label: "Today", icon: Home },
  { id: "offline", label: "Offline", icon: CloudOff },
  { id: "me", label: "Me", icon: CircleUserRound },
];

const defaultTripContext: TripContext = {
  device: "iPhone",
  network: "Travel eSIM",
  paymentMethods: ["Alipay", "International card"],
  foodNeeds: ["Peanut allergy"],
  spiceLevel: "Mild",
  tripDays: 7,
  travelerCount: 2,
  cities: ["Beijing", "Shanghai"],
};

const tripContextOptions = {
  devices: ["iPhone", "Android phone"],
  networks: ["Travel eSIM", "International roaming", "Local SIM"],
  payments: ["Alipay", "WeChat Pay", "International card", "Cash"],
  foodNeeds: ["No restrictions", "Vegetarian", "Vegan", "Halal", "Gluten-free", "Peanut allergy"],
  spiceLevels: ["None", "Mild", "Medium", "Spicy"],
  cities: ["Beijing", "Shanghai", "Xi'an", "Chengdu", "Hangzhou", "Guangzhou", "Shenzhen", "Guilin"],
};

function normalizeTripContext(value?: Partial<TripContext> | null): TripContext {
  return {
    device: value?.device || defaultTripContext.device,
    network: value?.network || defaultTripContext.network,
    paymentMethods: Array.isArray(value?.paymentMethods)
      ? value.paymentMethods
      : defaultTripContext.paymentMethods,
    foodNeeds: Array.isArray(value?.foodNeeds)
      ? value.foodNeeds
      : defaultTripContext.foodNeeds,
    spiceLevel: value?.spiceLevel || defaultTripContext.spiceLevel,
    tripDays: Math.min(30, Math.max(1, value?.tripDays || defaultTripContext.tripDays)),
    travelerCount: Math.min(
      10,
      Math.max(1, value?.travelerCount || defaultTripContext.travelerCount)
    ),
    cities: Array.isArray(value?.cities) ? value.cities : defaultTripContext.cities,
  };
}

function parseCityList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,，;；、/]+/)
        .map((city) => city.trim())
        .filter(Boolean)
    )
  );
}

const readinessItems = [
  {
    id: "internet",
    label: "Internet",
    detail: "Install and test your China data plan",
    icon: Wifi,
    guideTitle: "Set up internet before departure",
    guideIntro: "A data plan is only ready after it has been installed and tested on the phone you will carry.",
    steps: [
      "Choose a China-compatible eSIM or confirm that your home carrier supports roaming in mainland China.",
      "Install the eSIM profile before departure, but keep the line turned off until you land.",
      "Set the new line as your mobile-data line and confirm data roaming is enabled for it.",
      "Test the provider's activation instructions and save its support details offline.",
      "Decide how you will access services that may be unavailable on mainland networks and test that setup before flying.",
      "Save your hotel address, emergency numbers, and arrival plan for use with no connection.",
    ],
    verify: "Verified when the profile is installed, activation steps are saved, and you have an offline fallback.",
  },
  {
    id: "payment",
    label: "Payment",
    detail: "Add and verify an international card",
    icon: WalletCards,
    guideTitle: "Prepare mobile payment",
    guideIntro: "Set up a primary wallet and a second way to pay before you need them at a station or restaurant.",
    steps: [
      "Install Alipay from the official app store and register with the phone number you will use in China.",
      "Complete identity verification using your passport when prompted.",
      "Open Me, then Bank Cards, and add an eligible international card.",
      "Confirm your bank can approve overseas and app-based transactions.",
      "Install WeChat and add a payment method as a backup where available.",
      "Carry a physical card and a small amount of cash for merchants that cannot accept your mobile wallet.",
    ],
    verify: "Verified after identity checks are complete and the wallet shows an active payment method.",
  },
  {
    id: "maps",
    label: "Maps",
    detail: "Save your cities and key locations",
    icon: Map,
    guideTitle: "Prepare maps and navigation",
    guideIntro: "China uses local map data and place names. Save destinations in both English and Chinese.",
    steps: [
      "Install Amap (高德地图) or Baidu Maps (百度地图). Apple Maps can be a useful alternative on iPhone.",
      "Download any available offline data for the cities on your itinerary.",
      "Save your hotel, airport or station, embassy, and first attraction.",
      "Check each saved place against its Chinese name and street address.",
      "Save screenshots of the route from your arrival point to the hotel.",
      "Do not rely on Google Maps alone for live transit or precise routing in mainland China.",
    ],
    verify: "Verified when your hotel and first-day destinations open correctly by Chinese name.",
  },
  {
    id: "rides",
    label: "Ride-hailing",
    detail: "Configure Didi and test a destination",
    icon: Navigation,
    guideTitle: "Set up ride-hailing",
    guideIntro: "The important test is not opening Didi. It is reaching the booking screen with the correct pickup and destination.",
    steps: [
      "Install Didi (滴滴出行), or open its mini app inside Alipay.",
      "Switch the interface to English where available and register your phone number.",
      "Connect Alipay or another supported payment method.",
      "Search for your hotel using its Chinese name and confirm the map pin.",
      "Practice changing the pickup point to a specific airport gate or station exit.",
      "Save the Chinese destination card so you can show it to a driver if the app fails.",
    ],
    verify: "Verified when you can reach the final booking screen without actually ordering a car.",
  },
  {
    id: "translate",
    label: "Translation",
    detail: "Download Chinese for offline use",
    icon: Languages,
    guideTitle: "Prepare translation tools",
    guideIntro: "Use one general translator, one offline option, and this Agent for travel-specific context.",
    steps: [
      "Install your preferred translation app before departure.",
      "Download Simplified Chinese for offline translation.",
      "Enable camera access and test the camera mode on Chinese text.",
      "Test speech input and playback in a noisy environment.",
      "Install Pleco if you want a dependable Chinese dictionary and handwriting lookup.",
      "Save essential phrases for allergies, your hotel, and emergency help as offline cards.",
    ],
    verify: "Verified after text, camera, and offline translation each work once on your phone.",
  },
];

const arrivalSteps = [
  {
    id: "arrivals",
    time: "00:00",
    title: "Clear arrivals",
    detail: "Collect your bags and keep your passport available.",
    verification: "You confirm when you are through immigration and baggage claim.",
    action: "I’m through arrivals",
    icon: PlaneLanding,
    checkType: "confirm",
  },
  {
    id: "network",
    time: "00:15",
    title: "Activate your data line",
    detail: "Turn on the China eSIM, enable roaming, and wait for a mobile-data connection.",
    verification: "The Agent makes a fresh request and confirms this phone can reach the internet.",
    action: "Test connection",
    icon: Wifi,
    checkType: "network",
  },
  {
    id: "location",
    time: "00:20",
    title: "Confirm your location",
    detail: "Use your live position to identify the terminal, station exit, or pickup zone.",
    verification: "The browser requests a current GPS position from this device.",
    action: "Check my location",
    icon: MapPin,
    checkType: "location",
  },
  {
    id: "payment",
    time: "00:25",
    title: "Open your payment wallet",
    detail: "Open Alipay and confirm your verified account and international card are available.",
    verification: "Payment apps do not expose account status to this PWA, so you confirm the real screen.",
    action: "Alipay opened correctly",
    icon: WalletCards,
    checkType: "confirm",
  },
  {
    id: "ride",
    time: "00:30",
    title: "Build a real Didi trip",
    detail: "Set the airport pickup point and your hotel, then stop before placing the order.",
    verification: "You confirm Didi reaches the fare estimate with the correct pickup and destination.",
    action: "Fare estimate ready",
    icon: Navigation,
    checkType: "confirm",
  },
  {
    id: "driver-card",
    time: "00:35",
    title: "Open the Chinese address card",
    detail: "Keep the hotel name, address, and phone number ready to show a driver.",
    verification: "The Agent confirms the saved offline destination card is available on this device.",
    action: "Verify offline card",
    icon: Languages,
    checkType: "offline",
  },
  {
    id: "hotel",
    time: "01:00",
    title: "Arrive and close the playbook",
    detail: "Check in, reconnect to hotel Wi-Fi, and keep your offline pack available.",
    verification: "You confirm arrival. The Agent records which systems worked and which need attention.",
    action: "I’ve arrived",
    icon: ShieldCheck,
    checkType: "confirm",
  },
] as const;

const offlineCardStyles: Record<
  OfflineCardType,
  { icon: typeof MapPin; tone: string; label: string }
> = {
  hotel: { icon: MapPin, tone: "bg-[#f1dfbd]", label: "Hotel" },
  dietary: { icon: Utensils, tone: "bg-[#e8d4c7]", label: "Dietary" },
  emergency: { icon: Phone, tone: "bg-[#dbe2d2]", label: "Emergency" },
  transport: { icon: TrainFront, tone: "bg-white", label: "Transport" },
  custom: { icon: Ticket, tone: "bg-[#ece7dc]", label: "Custom" },
};

function AppHeader({
  online,
  onInstall,
  installed,
  onNotifications,
}: {
  online: boolean;
  onInstall: () => void;
  installed: boolean;
  onNotifications: () => void;
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
          <button
            type="button"
            onClick={onInstall}
            className="flex h-9 items-center gap-2 border border-ink/15 bg-white px-3 text-[10px] font-bold text-ink"
          >
            {installed ? <Check className="h-3.5 w-3.5 text-[#34735a]" /> : <Download className="h-3.5 w-3.5" />}
            {installed ? "Installed" : "Install"}
          </button>
          <button
            type="button"
            aria-label="Open reminders"
            onClick={onNotifications}
            className="flex h-9 w-9 items-center justify-center border border-ink/15 bg-white"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function InstallSheet({
  canInstall,
  installed,
  onInstall,
  onClose,
}: {
  canInstall: boolean;
  installed: boolean;
  onInstall: () => void;
  onClose: () => void;
}) {
  const [platform] = useState<"ios" | "desktop" | "other">(() => {
    if (typeof navigator === "undefined") return "other";
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return "ios";
    if (/Macintosh|Windows|Linux/i.test(navigator.userAgent)) return "desktop";
    return "other";
  });
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [secureContext] = useState(() =>
    typeof window === "undefined" ? false : window.isSecureContext
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => setServiceWorkerReady(true));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm">
      <div className="sheet-in w-full max-w-md bg-paper p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
              Install China Agent
            </p>
            <h2 className="mt-1 font-display text-2xl font-black">
              Add it like a phone app.
            </h2>
          </div>
          <button type="button" aria-label="Close install guide" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {installed ? (
          <div className="mt-5 border border-[#34735a]/25 bg-[#edf5ef] p-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[#34735a]">
              <Check className="h-4 w-4" />
              Running as an installed app
            </p>
          </div>
        ) : canInstall ? (
          <button
            type="button"
            onClick={onInstall}
            className="mt-5 flex min-h-12 w-full items-center justify-between bg-cinnabar px-4 text-xs font-bold text-white"
          >
            Install on this device
            <Download className="h-4 w-4" />
          </button>
        ) : platform === "ios" ? (
          <ol className="mt-5 space-y-3 border border-ink/15 bg-white p-4 text-xs leading-5">
            <li><strong>1.</strong> Open this site in Safari.</li>
            <li><strong>2.</strong> Tap the Share button.</li>
            <li><strong>3.</strong> Choose <strong>Add to Home Screen</strong>, then Add.</li>
          </ol>
        ) : (
          <div className="mt-5 border border-ink/15 bg-white p-4">
            <p className="text-xs font-bold">Desktop verification</p>
            <p className="mt-2 text-[10px] leading-5 text-ink/45">
              Open the app in Chrome or Edge. Use the install icon in the address bar, or open
              the browser menu and choose Install China Travel Agent.
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Manifest", true],
            ["Service worker", serviceWorkerReady],
            ["Secure origin", secureContext],
          ].map(([label, ready]) => (
            <div key={label as string} className="border border-ink/10 bg-white p-3 text-center">
              <span className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
                ready ? "bg-[#34735a] text-white" : "bg-paper text-ink/35"
              }`}>
                {ready ? <Check className="h-3 w-3" /> : "·"}
              </span>
              <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-ink/45">
                {label as string}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[9px] leading-4 text-ink/45">
          On localhost, Chrome treats the origin as secure for testing. On a phone, the deployed
          site must use HTTPS.
        </p>
      </div>
    </div>
  );
}

function NotificationsSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm">
      <div className="sheet-in w-full max-w-md bg-paper p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
              Travel reminders
            </p>
            <h2 className="mt-1 font-display text-2xl font-black">Nothing needs attention.</h2>
          </div>
          <button type="button" aria-label="Close reminders" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 flex min-h-40 flex-col items-center justify-center border border-ink/15 bg-white p-5 text-center">
          <Bell className="h-6 w-6 text-ink/35" />
          <p className="mt-3 text-xs font-bold">No active reminders</p>
          <p className="mt-2 max-w-[270px] text-[10px] leading-5 text-ink/45">
            Upcoming train, ticket, itinerary, preparation, and unresolved Agent reminders will
            appear here. The icon only shows a red dot when a real reminder exists.
          </p>
        </div>
      </div>
    </div>
  );
}

function AgentScreen({
  authConfigured,
  user,
  onGuide,
}: {
  authConfigured: boolean;
  user: AuthUser | null;
  onGuide: () => void;
}) {
  return (
    <div className="screen-in">
      <div className="relative mb-4 overflow-hidden bg-ink p-5 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cinnabar/20 blur-3xl" />
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#f1dfbd]">
            Live local agent
          </p>
          <h1 className="mt-3 font-display text-3xl font-black leading-tight">
            Understand what is
            <br />
            happening now.
          </h1>
          <p className="mt-3 max-w-[310px] text-xs leading-5 text-white/55">
            Fix a problem, hear a place, understand a menu or sign, or prepare a driver card.
          </p>
        </div>
      </div>

      <AgentChat authConfigured={authConfigured} user={user} onGuide={onGuide} />
    </div>
  );
}

function PrepareScreen() {
  const [checked, setChecked] = useState(["internet", "payment", "maps", "translate"]);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [playbookResults, setPlaybookResults] = useState<Record<string, PlaybookResult>>({});
  const [checkingStep, setCheckingStep] = useState<string | null>(null);
  const progress = Math.round((checked.length / readinessItems.length) * 100);
  const activeGuide = readinessItems.find((item) => item.id === guideId);
  const passedSteps = Object.values(playbookResults).filter((result) => result === "passed").length;

  function toggleCheck(id: string) {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function verifyArrivalStep(step: (typeof arrivalSteps)[number]) {
    setCheckingStep(step.id);

    if (step.checkType === "network") {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const response = await fetch("/manifest.webmanifest", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("unreachable");
        setPlaybookResults((current) => ({ ...current, [step.id]: "passed" }));
      } catch {
        setPlaybookResults((current) => ({ ...current, [step.id]: "failed" }));
      } finally {
        setCheckingStep(null);
      }
      return;
    }

    if (step.checkType === "location") {
      if (!("geolocation" in navigator)) {
        setPlaybookResults((current) => ({ ...current, [step.id]: "failed" }));
        setCheckingStep(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setPlaybookResults((current) => ({ ...current, [step.id]: "passed" }));
          setCheckingStep(null);
        },
        () => {
          setPlaybookResults((current) => ({ ...current, [step.id]: "failed" }));
          setCheckingStep(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
      return;
    }

    setPlaybookResults((current) => ({ ...current, [step.id]: "passed" }));
    setCheckingStep(null);
  }

  return (
    <>
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
          <p className="mt-2 text-xs leading-5 text-ink/50">
            Follow each guide, test the setup on your own phone, then mark it verified.
          </p>
          <div className="mt-4 space-y-3">
            {readinessItems.map(({ id, label, detail, icon: Icon }, index) => {
              const done = checked.includes(id);
              return (
                <article
                  key={id}
                  className={`border bg-white transition-colors ${
                    done ? "border-[#34735a]/30" : "border-ink/15"
                  }`}
                >
                  <div className="grid grid-cols-[42px_1fr_auto] items-start gap-3 p-4 pb-3">
                    <span className={`flex h-10 w-10 items-center justify-center ${done ? "bg-[#edf5ef]" : "bg-paper"}`}>
                      <Icon className={`h-4 w-4 ${done ? "text-[#34735a]" : "text-cinnabar"}`} />
                    </span>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/30">
                        Step {index + 1}
                      </span>
                      <h2 className="mt-1 text-sm font-bold text-ink">{label}</h2>
                      <p className="mt-1 text-[10px] leading-4 text-ink/45">{detail}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Mark ${label} ${done ? "not verified" : "verified"}`}
                      aria-pressed={done}
                      onClick={() => toggleCheck(id)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                        done
                          ? "border-[#34735a] bg-[#34735a] text-white"
                          : "border-ink/20 text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center border-t border-ink/10">
                    <button
                      type="button"
                      onClick={() => setGuideId(id)}
                      className="flex min-h-11 items-center gap-2 px-4 text-left text-[10px] font-bold text-cinnabar"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Open setup guide
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCheck(id)}
                      className={`min-h-11 border-l border-ink/10 px-4 text-[9px] font-bold uppercase tracking-[0.1em] ${
                        done ? "text-[#34735a]" : "text-ink/40"
                      }`}
                    >
                      {done ? "Verified" : "Mark done"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {progress < 100 ? (
          <section className="border border-cinnabar/30 bg-[#fff3ed] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">Next action</p>
            <h2 className="mt-3 font-display text-xl font-black">
              Finish {readinessItems.find((item) => !checked.includes(item.id))?.label.toLowerCase()} setup.
            </h2>
            <p className="mt-2 text-xs leading-5 text-ink/50">
              Open the guide, complete each step, and verify it on the device you will carry.
            </p>
          </section>
        ) : (
          <section className="border border-[#34735a]/25 bg-[#edf5ef] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#34735a]">Ready for arrival</p>
            <h2 className="mt-3 font-display text-xl font-black">All five systems are verified.</h2>
          </section>
        )}

        <section className="bg-[#f1dfbd] p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">Arrival playbook</p>
          <h2 className="mt-3 font-display text-xl font-black">Your first hour in China</h2>
          <p className="mt-2 text-xs leading-5 text-ink/50">
            A step-by-step flow from airplane mode to your hotel pickup point.
          </p>
          <button
            type="button"
            onClick={() => {
              setPlaybookResults({});
              setPlaybookOpen(true);
            }}
            className="mt-4 flex items-center gap-2 text-xs font-bold text-cinnabar"
          >
            Open 7-step playbook
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </div>

      {activeGuide && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prepare-guide-title"
        >
          <button
            type="button"
            aria-label="Close setup guide"
            className="absolute inset-0"
            onClick={() => setGuideId(null)}
          />
          <div className="sheet-in relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
                  {activeGuide.label} guide
                </p>
                <h2 id="prepare-guide-title" className="mt-2 font-display text-3xl font-black leading-none">
                  {activeGuide.guideTitle}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setGuideId(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/15 bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-ink/50">{activeGuide.guideIntro}</p>
            <ol className="mt-6 border-y border-ink/15">
              {activeGuide.steps.map((step, index) => (
                <li
                  key={step}
                  className={`grid grid-cols-[28px_1fr] gap-3 py-4 ${
                    index !== activeGuide.steps.length - 1 ? "border-b border-ink/10" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[9px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-xs leading-5 text-ink/70">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 bg-[#f1dfbd] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">Verification standard</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-ink">{activeGuide.verify}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!checked.includes(activeGuide.id)) toggleCheck(activeGuide.id);
                setGuideId(null);
              }}
              className="mt-4 flex w-full items-center justify-between bg-ink p-4 text-xs font-bold text-white"
            >
              {checked.includes(activeGuide.id) ? "Close guide" : "Mark verified"}
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {playbookOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="arrival-playbook-title"
        >
          <button
            type="button"
            aria-label="Close arrival playbook"
            className="absolute inset-0"
            onClick={() => setPlaybookOpen(false)}
          />
          <div className="sheet-in relative max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/15" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
                  Arrival playbook
                </p>
                <h2 id="arrival-playbook-title" className="mt-2 font-display text-3xl font-black leading-none">
                  Your first hour in China
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPlaybookOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/15 bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 bg-[#edf5ef] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">How verification works</p>
              <p className="mt-2 text-xs leading-5 text-ink/65">
                Network and location are tested by this device. Payment and ride-hailing require your confirmation because those apps do not expose account status to the Agent.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-ink/15 pb-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink/40">
                7-step timeline
              </p>
              <span className="font-mono text-[10px] font-bold text-[#34735a]">
                {passedSteps}/7 checked
              </span>
            </div>

            <ol>
              {arrivalSteps.map((step, index) => {
                const StepIcon = step.icon;
                const result = playbookResults[step.id];
                const checking = checkingStep === step.id;

                return (
                  <li key={step.id} className="relative grid grid-cols-[42px_1fr] gap-3 py-4">
                    {index !== arrivalSteps.length - 1 && (
                      <span className="absolute bottom-0 left-5 top-12 w-px bg-ink/10" />
                    )}
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${
                        result === "passed"
                          ? "bg-[#34735a] text-white"
                          : result === "failed"
                            ? "bg-cinnabar text-white"
                            : "bg-white text-cinnabar"
                      }`}
                    >
                      {result === "passed" ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </span>
                    <div className="border-b border-ink/10 pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-bold text-ink">{step.title}</h3>
                        <span className="font-mono text-[9px] font-bold text-ink/30">{step.time}</span>
                      </div>
                      <p className="mt-1 text-[10px] leading-4 text-ink/50">{step.detail}</p>
                      <div className="mt-3 bg-white p-3">
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-ink/30">
                          How it is verified
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-ink/55">{step.verification}</p>
                      </div>
                      {result === "failed" && (
                        <p className="mt-2 text-[10px] font-semibold leading-4 text-cinnabar">
                          Check failed. Keep the offline fallback open and retry when conditions change.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => verifyArrivalStep(step)}
                        disabled={checking}
                        className={`mt-3 flex min-h-10 w-full items-center justify-between px-3 text-[10px] font-bold disabled:opacity-50 ${
                          result === "passed"
                            ? "border border-[#34735a]/25 bg-[#edf5ef] text-[#34735a]"
                            : "bg-ink text-white"
                        }`}
                      >
                        {checking
                          ? "Checking..."
                          : result === "passed"
                            ? "Verified"
                            : step.action}
                        {result === "passed" ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            {passedSteps === arrivalSteps.length && (
              <div className="mt-2 border border-[#34735a]/25 bg-[#edf5ef] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#34735a]">Arrival verified</p>
                <p className="mt-2 font-display text-xl font-black">
                  Your essential arrival systems worked in the real environment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function OfflineScreen() {
  const [cards, setCards] = useState<OfflineCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<OfflineCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const card = cards.find((item) => item.id === selectedId);

  useEffect(() => {
    let active = true;

    async function loadCards() {
      try {
        const storedCards = await getOfflineCards();
        if (active) setCards(storedCards);
        if ("storage" in navigator && "persist" in navigator.storage) {
          void navigator.storage.persist();
        }
      } catch {
        if (active) {
          setStorageError(
            "This browser could not open offline storage. Check Safari private browsing or site storage settings."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCards();
    return () => {
      active = false;
    };
  }, []);

  function sortOfflineCards(nextCards: OfflineCard[]) {
    return [...nextCards].sort(
      (left, right) =>
        Number(right.pinned) - Number(left.pinned) ||
        left.sortOrder - right.sortOrder ||
        right.updatedAt.localeCompare(left.updatedAt)
    );
  }

  async function persistCard(nextCard: OfflineCard) {
    setSaving(true);
    setStorageError("");

    try {
      const savedCard = {
        ...nextCard,
        updatedAt: new Date().toISOString(),
      };
      await saveOfflineCard(savedCard);
      setCards((current) =>
        sortOfflineCards([
          ...current.filter((item) => item.id !== savedCard.id),
          savedCard,
        ])
      );
      setSelectedId(savedCard.id);
      setEditingCard(null);
      setConfirmDelete(false);
    } catch {
      setStorageError("The card could not be saved on this device. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeCard(cardId: string) {
    setSaving(true);
    setStorageError("");

    try {
      await deleteOfflineCard(cardId);
      setCards((current) => current.filter((item) => item.id !== cardId));
      setSelectedId(null);
      setEditingCard(null);
      setConfirmDelete(false);
    } catch {
      setStorageError("The card could not be deleted from this device.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePinned(item: OfflineCard) {
    await persistCard({ ...item, pinned: !item.pinned });
  }

  if (loading) {
    return (
      <div className="screen-in flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <CloudOff className="mx-auto h-7 w-7 text-cinnabar" />
          <p className="mt-3 text-xs font-bold text-ink">Loading this device&apos;s offline pack...</p>
        </div>
      </div>
    );
  }

  if (editingCard) {
    const isNew = !cards.some((item) => item.id === editingCard.id);

    return (
      <div className="screen-in space-y-5 pb-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setEditingCard(null);
              setConfirmDelete(false);
            }}
            className="flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/35">
            Stored on this device
          </span>
        </div>

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
            {isNew ? "New offline card" : "Edit offline card"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-black text-ink">
            Make it useful without signal.
          </h1>
        </section>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void persistCard(editingCard);
          }}
        >
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
              Card type
            </span>
            <select
              value={editingCard.type}
              onChange={(event) =>
                setEditingCard({
                  ...editingCard,
                  type: event.target.value as OfflineCardType,
                })
              }
              className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-xs font-semibold outline-none focus:border-cinnabar"
            >
              {Object.entries(offlineCardStyles).map(([value, style]) => (
                <option key={value} value={value}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>

          {[
            ["title", "Card title", "Hotel address"],
            ["primaryText", "Large text shown locally", "请输入中文内容"],
            ["secondaryText", "Translation or context", "English explanation"],
            ["phone", "Phone number (optional)", "+86 ..."],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
                {label}
              </span>
              <input
                required={field === "title" || field === "primaryText"}
                value={editingCard[field as keyof OfflineCard] as string}
                placeholder={placeholder}
                onChange={(event) =>
                  setEditingCard({ ...editingCard, [field]: event.target.value })
                }
                className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-xs outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            </label>
          ))}

          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/40">
              Notes
            </span>
            <textarea
              value={editingCard.notes}
              placeholder="Instructions, emergency numbers, carriage, gate, or other details."
              onChange={(event) =>
                setEditingCard({ ...editingCard, notes: event.target.value })
              }
              rows={4}
              className="mt-2 w-full resize-none border border-ink/15 bg-white p-3 text-xs leading-5 outline-none placeholder:text-ink/25 focus:border-cinnabar"
            />
          </label>

          <button
            type="button"
            aria-pressed={editingCard.pinned}
            onClick={() =>
              setEditingCard({ ...editingCard, pinned: !editingCard.pinned })
            }
            className={`flex min-h-12 w-full items-center justify-between border px-4 text-xs font-bold ${
              editingCard.pinned
                ? "border-[#34735a]/30 bg-[#edf5ef] text-[#34735a]"
                : "border-ink/15 bg-white text-ink/55"
            }`}
          >
            Keep at the top
            <Check className={`h-4 w-4 ${editingCard.pinned ? "" : "opacity-20"}`} />
          </button>

          {storageError && (
            <div className="border border-cinnabar/25 bg-[#fff3ed] p-3 text-[10px] leading-4 text-cinnabar">
              {storageError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-13 w-full items-center justify-between bg-ink p-4 text-xs font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save to this device"}
            <Check className="h-4 w-4" />
          </button>

          {!isNew &&
            (confirmDelete ? (
              <div className="border border-cinnabar/25 bg-[#fff3ed] p-4">
                <p className="text-xs font-bold text-cinnabar">Delete this offline card?</p>
                <p className="mt-1 text-[10px] leading-4 text-ink/45">
                  This removes it from this browser and cannot be undone.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-11 border border-ink/15 bg-white text-[10px] font-bold"
                  >
                    Keep card
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void removeCard(editingCard.id)}
                    className="min-h-11 bg-cinnabar text-[10px] font-bold text-white disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex min-h-12 w-full items-center justify-between border border-cinnabar/25 px-4 text-xs font-bold text-cinnabar"
              >
                Delete card
                <Trash2 className="h-4 w-4" />
              </button>
            ))}
        </form>
      </div>
    );
  }

  if (card) {
    const style = offlineCardStyles[card.type];
    const CardIcon = style.icon;
    return (
      <div className="screen-in min-h-[calc(100dvh-152px)]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            All offline cards
          </button>
          <button
            type="button"
            onClick={() => setEditingCard({ ...card })}
            className="flex h-10 items-center gap-2 border border-ink/15 bg-white px-3 text-[10px] font-bold"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <div className={`${style.tone} flex min-h-[520px] flex-col border border-ink/15 p-6`}>
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
              <CardIcon className="h-5 w-5" />
            </span>
            <button
              type="button"
              onClick={() => void togglePinned(card)}
              className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/35"
            >
              {card.pinned ? "Pinned · Saved offline" : "Pin · Saved offline"}
            </button>
          </div>
          <div className="my-auto text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">{card.title}</p>
            <p className="mt-6 whitespace-pre-line break-words font-display text-5xl font-black leading-[1.08] text-ink">
              {card.primaryText}
            </p>
            {card.secondaryText && (
              <p className="mt-5 whitespace-pre-line text-sm leading-6 text-ink/55">
                {card.secondaryText}
              </p>
            )}
            {card.phone && <p className="mt-4 text-sm font-bold text-cinnabar">{card.phone}</p>}
            {card.notes && (
              <p className="mt-5 border-t border-ink/15 pt-5 text-xs leading-5 text-ink/50">
                {card.notes}
              </p>
            )}
          </div>
          <div className="border-t border-ink/15 pt-5 text-center text-[10px] font-semibold text-ink/40">
            Stored only on this device
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-in space-y-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">No signal required</p>
          <h1 className="mt-2 font-display text-4xl font-black leading-none text-ink">Your offline pack.</h1>
          <p className="mt-3 text-xs leading-5 text-ink/50">
            Edit the details you need when roaming, Wi-Fi, or your apps fail.
          </p>
        </div>
        <button
          type="button"
          aria-label="Add offline card"
          onClick={() => setEditingCard(createOfflineCard(cards.length))}
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-cinnabar text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </section>

      {storageError && (
        <div className="border border-cinnabar/25 bg-[#fff3ed] p-3 text-[10px] leading-4 text-cinnabar">
          {storageError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {cards.map((item) => {
          const style = offlineCardStyles[item.type];
          const Icon = style.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`${style.tone} relative flex min-h-52 flex-col items-start overflow-hidden border border-ink/15 p-4 text-left`}
            >
              {item.pinned && (
                <span className="absolute right-3 top-3 text-[8px] font-bold uppercase tracking-wider text-[#34735a]">
                  Pinned
                </span>
              )}
              <Icon className="h-5 w-5 text-cinnabar" />
              <span className="mt-4 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink/45">
                {item.title}
              </span>
              <span className="mt-auto flex min-h-[50%] w-full items-end">
                <span className="line-clamp-3 block break-words font-display text-[clamp(1.35rem,6vw,1.75rem)] font-black leading-[1.08] text-ink">
                  {item.primaryText || "Tap to add content"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border border-[#34735a]/25 bg-[#edf5ef] p-4">
        <Check className="h-5 w-5 text-[#34735a]" />
        <div>
          <p className="text-xs font-bold">{cards.length} cards stored on this device</p>
          <p className="mt-1 text-[10px] text-ink/45">
            Available without internet. Clearing Safari website data removes them.
          </p>
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
  const [tripContext, setTripContext] = useState(() => normalizeTripContext());
  const [tripContextDraft, setTripContextDraft] = useState(() => normalizeTripContext());
  const [editingTripContext, setEditingTripContext] = useState(false);
  const [loadingTripContext, setLoadingTripContext] = useState(Boolean(authConfigured && user));
  const [savingTripContext, setSavingTripContext] = useState(false);
  const [tripContextError, setTripContextError] = useState("");
  const [customCitiesInput, setCustomCitiesInput] = useState("");

  useEffect(() => {
    if (!authConfigured || !user) {
      return;
    }

    const userId = user.id;
    let active = true;

    async function loadTripContext() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("trip_contexts")
        .select(
          "device, network, payment_methods, food_needs, spice_level, trip_days, traveler_count, cities"
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setTripContextError("Trip memory could not be loaded. Please try again.");
      } else if (data) {
        const savedContext = normalizeTripContext({
          device: data.device,
          network: data.network,
          paymentMethods: data.payment_methods,
          foodNeeds: data.food_needs,
          spiceLevel: data.spice_level,
          tripDays: data.trip_days,
          travelerCount: data.traveler_count,
          cities: data.cities,
        });
        setTripContext(savedContext);
        setTripContextDraft(savedContext);
      }

      setLoadingTripContext(false);
    }

    void loadTripContext();
    return () => {
      active = false;
    };
  }, [authConfigured, user]);

  async function saveTripContext() {
    const normalizedDraft = normalizeTripContext({
      ...tripContextDraft,
      cities: Array.from(
        new Set([
          ...tripContextDraft.cities.filter((city) =>
            tripContextOptions.cities.includes(city)
          ),
          ...parseCityList(customCitiesInput),
        ])
      ),
    });

    if (!authConfigured || !user) {
      setTripContext(normalizedDraft);
      setEditingTripContext(false);
      return;
    }

    setSavingTripContext(true);
    setTripContextError("");

    const supabase = createClient();
    const { error } = await supabase.from("trip_contexts").upsert(
      {
        user_id: user.id,
        device: normalizedDraft.device.trim(),
        network: normalizedDraft.network.trim(),
        payment_methods: normalizedDraft.paymentMethods,
        food_needs: normalizedDraft.foodNeeds,
        spice_level: normalizedDraft.spiceLevel,
        trip_days: normalizedDraft.tripDays,
        traveler_count: normalizedDraft.travelerCount,
        cities: normalizedDraft.cities,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      setTripContextError("Trip memory could not be saved. Please try again.");
    } else {
      setTripContext(normalizedDraft);
      setEditingTripContext(false);
    }

    setSavingTripContext(false);
  }

  if (editingTripContext) {
    const choiceClass = (selected: boolean) =>
      `min-h-10 border px-3 text-[10px] font-bold transition-colors ${
        selected
          ? "border-ink bg-ink text-white"
          : "border-ink/15 bg-white text-ink/55"
      }`;
    const customDevice = tripContextOptions.devices.includes(tripContextDraft.device)
      ? ""
      : tripContextDraft.device;
    const customNetwork = tripContextOptions.networks.includes(tripContextDraft.network)
      ? ""
      : tripContextDraft.network;
    const customPayment =
      tripContextDraft.paymentMethods.find(
        (item) => !tripContextOptions.payments.includes(item)
      ) ?? "";
    const customFoodNeed =
      tripContextDraft.foodNeeds.find(
        (item) => !tripContextOptions.foodNeeds.includes(item)
      ) ?? "";
    const customCities = tripContextDraft.cities.filter(
      (item) => !tripContextOptions.cities.includes(item)
    );
    const canSaveTripContext =
      Boolean(tripContextDraft.device.trim()) &&
      Boolean(tripContextDraft.network.trim()) &&
      tripContextDraft.paymentMethods.length > 0 &&
      tripContextDraft.foodNeeds.length > 0 &&
      Boolean(tripContextDraft.spiceLevel) &&
      tripContextDraft.tripDays >= 1 &&
      tripContextDraft.tripDays <= 30 &&
      tripContextDraft.travelerCount >= 1 &&
      tripContextDraft.travelerCount <= 10 &&
      (tripContextDraft.cities.some((city) =>
        tripContextOptions.cities.includes(city)
      ) ||
        parseCityList(customCitiesInput).length > 0);

    function toggleListValue(
      key: "paymentMethods" | "foodNeeds" | "cities",
      value: string
    ) {
      const current = tripContextDraft[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      setTripContextDraft({ ...tripContextDraft, [key]: next });
    }

    return (
      <div className="screen-in space-y-5 pb-4">
        <button
          type="button"
          onClick={() => {
            setTripContextDraft(normalizeTripContext(tripContext));
            setCustomCitiesInput(
              normalizeTripContext(tripContext)
                .cities.filter((city) => !tripContextOptions.cities.includes(city))
                .join(", ")
            );
            setTripContextError("");
            setEditingTripContext(false);
          }}
          className="flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <section>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
            Edit trip context
          </p>
          <h1 className="mt-2 font-display text-3xl font-black text-ink">
            Teach the Agent once.
          </h1>
          <p className="mt-3 text-xs leading-5 text-ink/50">
            These details become the Agent&apos;s long-term travel memory across your trip.
          </p>
        </section>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void saveTripContext();
          }}
        >
          <fieldset>
            <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Device
            </legend>
            <p className="mt-1 text-[9px] leading-4 text-ink/35">
              The phone you will carry in China
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tripContextOptions.devices.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setTripContextDraft({ ...tripContextDraft, device: option })
                  }
                  className={choiceClass(tripContextDraft.device === option)}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setTripContextDraft({ ...tripContextDraft, device: "Other" })
                }
                className={choiceClass(Boolean(customDevice))}
              >
                Other
              </button>
            </div>
            {customDevice && (
              <textarea
                required
                maxLength={100}
                rows={1}
                value={customDevice === "Other" ? "" : customDevice}
                placeholder="Enter your device"
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    device: event.target.value,
                  })
                }
                className="mt-2 w-full resize-none border border-ink/15 bg-white p-3 text-xs leading-5 outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            )}
          </fieldset>

          <fieldset>
            <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Network
            </legend>
            <p className="mt-1 text-[9px] leading-4 text-ink/35">
              Your primary way to get mobile data
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tripContextOptions.networks.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setTripContextDraft({ ...tripContextDraft, network: option })
                  }
                  className={choiceClass(tripContextDraft.network === option)}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setTripContextDraft({ ...tripContextDraft, network: "Other" })
                }
                className={choiceClass(Boolean(customNetwork))}
              >
                Other
              </button>
            </div>
            {customNetwork && (
              <input
                required
                maxLength={100}
                value={customNetwork === "Other" ? "" : customNetwork}
                placeholder="Enter another network option"
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    network: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full border border-ink/15 bg-white px-3 text-xs outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            )}
          </fieldset>

          <fieldset>
            <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Payment
            </legend>
            <p className="mt-1 text-[9px] leading-4 text-ink/35">
              Select every payment method you can use
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tripContextOptions.payments.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleListValue("paymentMethods", option)}
                  className={choiceClass(
                    tripContextDraft.paymentMethods.includes(option)
                  )}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  customPayment
                    ? setTripContextDraft({
                        ...tripContextDraft,
                        paymentMethods: tripContextDraft.paymentMethods.filter(
                          (item) => item !== customPayment
                        ),
                      })
                    : setTripContextDraft({
                        ...tripContextDraft,
                        paymentMethods: [...tripContextDraft.paymentMethods, "Other"],
                      })
                }
                className={choiceClass(Boolean(customPayment))}
              >
                Other
              </button>
            </div>
            {customPayment && (
              <input
                required
                maxLength={100}
                value={customPayment === "Other" ? "" : customPayment}
                placeholder="Enter another payment method"
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    paymentMethods: tripContextDraft.paymentMethods.map((item) =>
                      item === customPayment ? event.target.value : item
                    ),
                  })
                }
                className="mt-2 min-h-11 w-full border border-ink/15 bg-white px-3 text-xs outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            )}
          </fieldset>

          <fieldset>
            <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Food needs
            </legend>
            <p className="mt-1 text-[9px] leading-4 text-ink/35">
              Choose dietary needs, allergies, and preferred spice level
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tripContextOptions.foodNeeds.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (option === "No restrictions") {
                      setTripContextDraft({
                        ...tripContextDraft,
                        foodNeeds: tripContextDraft.foodNeeds.includes(option)
                          ? []
                          : [option],
                      });
                      return;
                    }
                    setTripContextDraft({
                      ...tripContextDraft,
                      foodNeeds: tripContextDraft.foodNeeds.includes(option)
                        ? tripContextDraft.foodNeeds.filter(
                            (item) => item !== option
                          )
                        : [
                            ...tripContextDraft.foodNeeds.filter(
                              (item) => item !== "No restrictions"
                            ),
                            option,
                          ],
                    });
                  }}
                  className={choiceClass(tripContextDraft.foodNeeds.includes(option))}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  customFoodNeed
                    ? setTripContextDraft({
                        ...tripContextDraft,
                        foodNeeds: tripContextDraft.foodNeeds.filter(
                          (item) => item !== customFoodNeed
                        ),
                      })
                    : setTripContextDraft({
                        ...tripContextDraft,
                        foodNeeds: [
                          ...tripContextDraft.foodNeeds.filter(
                            (item) => item !== "No restrictions"
                          ),
                          "Other",
                        ],
                      })
                }
                className={choiceClass(Boolean(customFoodNeed))}
              >
                Other
              </button>
            </div>
            {customFoodNeed && (
              <input
                required
                maxLength={100}
                value={customFoodNeed === "Other" ? "" : customFoodNeed}
                placeholder="Enter another dietary need or allergy"
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    foodNeeds: tripContextDraft.foodNeeds.map((item) =>
                      item === customFoodNeed ? event.target.value : item
                    ),
                  })
                }
                className="mt-2 min-h-11 w-full border border-ink/15 bg-white px-3 text-xs outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            )}
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Spice level
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tripContextOptions.spiceLevels.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setTripContextDraft({
                      ...tripContextDraft,
                      spiceLevel: option,
                    })
                  }
                  className={choiceClass(tripContextDraft.spiceLevel === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t border-ink/10 pt-5">
            <legend className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Itinerary
            </legend>
            <p className="mt-1 text-[9px] leading-4 text-ink/35">
              Trip length, group size, and cities you plan to visit
            </p>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Days
            </p>
            <div className="mt-2 border border-ink/15 bg-white p-4">
              <div className="flex items-end justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
                  Trip length
                </span>
                <span className="font-display text-3xl font-black leading-none text-cinnabar">
                  {tripContextDraft.tripDays}
                  <span className="ml-1 text-xs text-ink/40">days</span>
                </span>
              </div>
              <input
                aria-label="Trip days"
                type="range"
                min={1}
                max={30}
                step={1}
                value={tripContextDraft.tripDays}
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    tripDays: Number(event.target.value),
                  })
                }
                className="mt-5 h-1.5 w-full cursor-pointer accent-cinnabar"
              />
              <div className="mt-2 flex justify-between text-[8px] font-bold text-ink/30">
                <span>1 day</span>
                <span>30 days</span>
              </div>
            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Travelers
            </p>
            <div className="mt-2 border border-ink/15 bg-white p-4">
              <div className="flex items-end justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
                  Group size
                </span>
                <span className="font-display text-3xl font-black leading-none text-cinnabar">
                  {tripContextDraft.travelerCount}
                  <span className="ml-1 text-xs text-ink/40">
                    {tripContextDraft.travelerCount === 1 ? "traveler" : "travelers"}
                  </span>
                </span>
              </div>
              <input
                aria-label="Number of travelers"
                type="range"
                min={1}
                max={10}
                step={1}
                value={tripContextDraft.travelerCount}
                onChange={(event) =>
                  setTripContextDraft({
                    ...tripContextDraft,
                    travelerCount: Number(event.target.value),
                  })
                }
                className="mt-5 h-1.5 w-full cursor-pointer accent-cinnabar"
              />
              <div className="mt-2 flex justify-between text-[8px] font-bold text-ink/30">
                <span>1 traveler</span>
                <span>10 travelers</span>
              </div>
            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Cities
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tripContextOptions.cities.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleListValue("cities", option)}
                  className={choiceClass(tripContextDraft.cities.includes(option))}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomCitiesInput("");
                  setTripContextDraft({
                    ...tripContextDraft,
                    cities:
                      customCities.length > 0
                        ? tripContextDraft.cities.filter((item) =>
                            tripContextOptions.cities.includes(item)
                          )
                        : [...tripContextDraft.cities, "Other"],
                  });
                }}
                className={choiceClass(customCities.length > 0)}
              >
                Other
              </button>
            </div>
            {customCities.length > 0 && (
              <textarea
                required
                maxLength={500}
                rows={2}
                value={customCitiesInput}
                placeholder="Enter cities separated by spaces or commas"
                onChange={(event) => {
                  setCustomCitiesInput(event.target.value);
                  setTripContextDraft({
                    ...tripContextDraft,
                    cities: [
                      ...tripContextDraft.cities.filter((item) =>
                        tripContextOptions.cities.includes(item)
                      ),
                      ...(event.target.value ? parseCityList(event.target.value) : ["Other"]),
                    ],
                  });
                }}
                className="mt-2 w-full resize-none border border-ink/15 bg-white p-3 text-xs leading-5 outline-none placeholder:text-ink/25 focus:border-cinnabar"
              />
            )}
            {customCities.length > 0 && (
              <p className="mt-2 text-[9px] leading-4 text-ink/35">
                Saved as: {parseCityList(customCitiesInput).join(", ") || "Enter at least one city"}
              </p>
            )}
          </fieldset>

          {tripContextError && (
            <div className="border border-cinnabar/25 bg-[#fff3ed] p-3 text-[10px] leading-4 text-cinnabar">
              {tripContextError}
            </div>
          )}

          <button
            type="submit"
            disabled={savingTripContext || !canSaveTripContext}
            className="flex min-h-13 w-full items-center justify-between bg-ink p-4 text-xs font-bold text-white disabled:opacity-50"
          >
            {savingTripContext
              ? "Saving..."
              : authConfigured
                ? "Save trip memory"
                : "Save prototype changes"}
            <Check className="h-4 w-4" />
          </button>
        </form>
      </div>
    );
  }

  const displayedTripContext = normalizeTripContext(tripContext);

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
              Trip context
            </p>
            <p className="mt-2 max-w-[290px] text-[10px] leading-4 text-ink/45">
              The Agent&apos;s long-term travel memory, so you do not have to repeat your
              background every time you ask for help.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTripContextDraft(displayedTripContext);
              setCustomCitiesInput(
                displayedTripContext.cities
                  .filter((city) => !tripContextOptions.cities.includes(city))
                  .join(", ")
              );
              setTripContextError("");
              setEditingTripContext(true);
            }}
            className="flex h-9 shrink-0 items-center gap-2 border border-ink/15 bg-white px-3 text-[9px] font-bold"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="mt-3 border border-ink/15 bg-white">
          {[
            [
              Smartphone,
              "Device & network",
              `${displayedTripContext.device} · ${displayedTripContext.network}`,
            ],
            [
              WalletCards,
              "Payment",
              displayedTripContext.paymentMethods.join(" · "),
            ],
            [
              Utensils,
              "Food needs",
              `${displayedTripContext.foodNeeds.join(" · ")} · ${displayedTripContext.spiceLevel} spice`,
            ],
            [
              Map,
              "Itinerary",
              `${displayedTripContext.tripDays} days · ${displayedTripContext.travelerCount} travelers · ${displayedTripContext.cities.join(", ")}`,
            ],
          ].map(([Icon, label, value], index) => {
            const ItemIcon = Icon as typeof Smartphone;
            return (
              <div key={label as string} className={`flex w-full items-center p-4 text-left ${index !== 3 ? "border-b border-ink/10" : ""}`}>
                <span className="flex items-center gap-3">
                  <ItemIcon className="h-4 w-4 text-cinnabar" />
                  <span>
                    <span className="block text-xs font-bold">{label as string}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-ink/45">
                      {loadingTripContext ? "Loading..." : (value as string)}
                    </span>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        {tripContextError && (
          <p className="mt-2 text-[9px] leading-4 text-cinnabar">{tripContextError}</p>
        )}
      </section>
      <section>
        <div className="flex items-center gap-3 border border-ink/15 bg-white p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#edf5ef]">
            <ShieldCheck className="h-4 w-4 text-[#34735a]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold">Agent access</p>
              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#34735a]">
                Required
              </span>
            </div>
            <p className="mt-1 text-[9px] leading-4 text-ink/40">
              Location, camera, and notifications are required for contextual help.
            </p>
          </div>
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
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe2d2] font-display text-lg font-black">LX</span>
          <div className="flex-1">
            <p className="text-xs font-bold">Li Xian · Beijing</p>
            <p className="mt-1 text-[10px] text-ink/45">English · History · Family friendly</p>
            <p className="mt-2 text-[10px] font-bold text-[#34735a]">★ 4.9 · Available tomorrow 09:00</p>
            <p className="mt-2 text-[10px] font-bold text-cinnabar">WhatsApp: chinabuddy</p>
          </div>
        </div>
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
  const [activeTab, setActiveTab] = useState<Tab>("prepare");
  const [online, setOnline] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    );
  });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateInstalled = () =>
      setInstalled(
        displayMode.matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
      );

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstall);
    displayMode.addEventListener("change", updateInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstall);
      displayMode.removeEventListener("change", updateInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setInstallOpen(true);
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
    setInstallOpen(false);
  }

  async function signOut() {
    if (!authConfigured) return;
    setSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  const screen = (() => {
    if (activeTab === "agent") return null;
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
      <TodayDashboard
        authConfigured={authConfigured}
        user={user}
        openAgent={() => setActiveTab("agent")}
      />
    );
  })();

  return (
    <div className="travel-app min-h-dvh bg-[#e7e2d8]">
      <div className="mx-auto min-h-dvh max-w-md bg-paper shadow-[0_0_80px_rgba(19,18,15,0.12)]">
        <AppHeader
          online={online}
          onInstall={() => void installApp()}
          installed={installed}
          onNotifications={() => setNotificationsOpen(true)}
        />

        <main className="px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-4">
          {!authConfigured && (
            <div className="mb-4 border border-[#b98b34]/30 bg-[#fff8e8] p-3 text-[10px] leading-4 text-ink/60">
              <span className="font-bold text-ink">Prototype mode.</span> Add Supabase environment
              variables to enable Google and Meta sign-in.
            </div>
          )}
          <div hidden={activeTab !== "agent"}>
            <AgentScreen
              authConfigured={authConfigured}
              user={user}
              onGuide={() => setGuideOpen(true)}
            />
          </div>
          <div hidden={activeTab === "agent"}>{screen}</div>
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
        {installOpen && (
          <InstallSheet
            canInstall={Boolean(installPrompt)}
            installed={installed}
            onInstall={() => void installApp()}
            onClose={() => setInstallOpen(false)}
          />
        )}
        {notificationsOpen && (
          <NotificationsSheet onClose={() => setNotificationsOpen(false)} />
        )}
      </div>
    </div>
  );
}
