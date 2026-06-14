"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  LockKeyhole,
  MapPinned,
  Plane,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TicketCheck,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Answer = "ready" | "partial" | "not-ready";
type PassView = "overview" | "timeline" | "cards" | "fixes";

type Assessment = {
  country: string;
  departureDate: string;
  tripLength: string;
  travelers: string;
  cities: string[];
  phone: string;
  payment: Answer;
  connectivity: Answer;
  transport: Answer;
  bookings: Answer;
  address: Answer;
  dietary: string;
};

type Risk = {
  id: string;
  area: string;
  title: string;
  detail: string;
  action: string;
  weight: number;
  icon: typeof WalletCards;
};

const initialAssessment: Assessment = {
  country: "",
  departureDate: "",
  tripLength: "8-14 days",
  travelers: "Couple",
  cities: ["Beijing", "Shanghai"],
  phone: "iPhone",
  payment: "not-ready",
  connectivity: "partial",
  transport: "not-ready",
  bookings: "partial",
  address: "not-ready",
  dietary: "No special requirements",
};

const cityOptions = [
  "Beijing",
  "Shanghai",
  "Xi'an",
  "Chengdu",
  "Hangzhou",
  "Guilin",
  "Zhangjiajie",
  "Other",
];

const answerOptions: { value: Answer; label: string; hint: string }[] = [
  { value: "ready", label: "Done and tested", hint: "I know this works" },
  { value: "partial", label: "Started", hint: "Installed or booked, not tested" },
  { value: "not-ready", label: "Not yet", hint: "I need a clear setup plan" },
];

const scoreValue: Record<Answer, number> = {
  ready: 100,
  partial: 55,
  "not-ready": 10,
};

const assessmentAreas = [
  {
    key: "payment" as const,
    title: "Mobile payment",
    description: "Alipay or WeChat Pay linked to an international card",
    icon: WalletCards,
  },
  {
    key: "connectivity" as const,
    title: "Internet access",
    description: "A working eSIM, roaming plan, or mainland SIM strategy",
    icon: Wifi,
  },
  {
    key: "transport" as const,
    title: "Transport access",
    description: "Didi, maps, metro, and train booking ready to use",
    icon: MapPinned,
  },
  {
    key: "bookings" as const,
    title: "Advance reservations",
    description: "High-demand attractions and trains checked against your dates",
    icon: TicketCheck,
  },
  {
    key: "address" as const,
    title: "Chinese addresses",
    description: "Hotels and destinations saved in a format drivers can read",
    icon: Smartphone,
  },
];

const troubleshooting = [
  {
    title: "My Alipay payment was declined",
    steps: [
      "Check that passport verification and the bank card name match exactly.",
      "Try the merchant's dynamic payment QR instead of a personal transfer QR.",
      "Switch to WeChat Pay or the physical bank card if the merchant supports it.",
      "Keep cash available for the transaction and contact the card issuer only after checking app verification.",
    ],
  },
  {
    title: "My driver cannot find me",
    steps: [
      "Open the saved Chinese destination card and send the full Chinese address.",
      "Share the nearest landmark or gate, not only the attraction name.",
      "Use Didi's in-app translation message: 我在定位点等您 (I am waiting at the pinned location).",
      "Move to a legal pickup point if you are outside a station, airport, or pedestrian street.",
    ],
  },
  {
    title: "I missed my high-speed train",
    steps: [
      "Go to the staffed ticket counter with every traveler's passport.",
      "Ask whether the ticket can be changed to the next available train on the same day.",
      "Do not buy a duplicate until staff confirms the original ticket cannot be changed.",
      "Update hotel arrival time and any pickup booking after the new train is confirmed.",
    ],
  },
  {
    title: "My phone has no internet",
    steps: [
      "Turn data roaming on for your travel eSIM and confirm it is selected for mobile data.",
      "Restart the phone, then manually choose China Unicom or China Mobile if automatic selection fails.",
      "Use airport, hotel, or station Wi-Fi to access the provider's setup instructions.",
      "Keep your hotel Chinese address available offline before leaving Wi-Fi.",
    ],
  },
];

function calculateScore(assessment: Assessment) {
  const weights = {
    payment: 25,
    connectivity: 20,
    transport: 20,
    bookings: 20,
    address: 15,
  };

  return Math.round(
    assessmentAreas.reduce(
      (total, area) =>
        total + (scoreValue[assessment[area.key]] * weights[area.key]) / 100,
      0
    )
  );
}

function buildRisks(assessment: Assessment): Risk[] {
  const risks: Risk[] = [];

  if (assessment.payment !== "ready") {
    risks.push({
      id: "payment",
      area: "Payment",
      title:
        assessment.payment === "not-ready"
          ? "You may be unable to pay at QR-only merchants"
          : "Your mobile payment setup has not been tested",
      detail:
        "International cards can work in Chinese payment apps, but verification, merchant QR type, and bank approval can still block a transaction.",
      action: "Complete and test both a primary and backup payment method before departure.",
      weight: 25,
      icon: WalletCards,
    });
  }

  if (assessment.connectivity !== "ready") {
    risks.push({
      id: "connectivity",
      area: "Connectivity",
      title: "Your internet plan has a possible failure point",
      detail:
        "Maps, payments, ride-hailing, and booking confirmations all depend on a working mobile connection after landing.",
      action: `Follow the ${assessment.phone} setup path and save an offline fallback.`,
      weight: 20,
      icon: Wifi,
    });
  }

  if (assessment.transport !== "ready") {
    risks.push({
      id: "transport",
      area: "Transport",
      title: "Local transport is not ready for arrival day",
      detail:
        "Airport pickup points, Chinese map results, and passport-based train tickets are common sources of delay.",
      action: "Prepare Didi, a China-compatible map, and passport-linked train access.",
      weight: 20,
      icon: MapPinned,
    });
  }

  if (assessment.bookings !== "ready") {
    risks.push({
      id: "bookings",
      area: "Reservations",
      title: "Some tickets may sell out before you arrive",
      detail:
        "Popular trains and attractions often use timed or identity-linked reservations rather than walk-up admission.",
      action: "Use the personalized booking timeline to reserve in the right order.",
      weight: 20,
      icon: TicketCheck,
    });
  }

  if (assessment.address !== "ready") {
    risks.push({
      id: "address",
      area: "Navigation",
      title: "English-only addresses can fail with drivers",
      detail:
        "The English hotel name may not match the listing used by local map and ride-hailing apps.",
      action: "Save every hotel and station as a large-format Chinese address card.",
      weight: 15,
      icon: Smartphone,
    });
  }

  return risks.sort((a, b) => b.weight - a.weight);
}

function daysBefore(date: string, offset: number) {
  if (!date) return `T-${offset} days`;
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() - offset);
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function scoreTone(score: number) {
  if (score >= 80) return { label: "China ready", color: "#24835b", bg: "#eaf6ef" };
  if (score >= 55) return { label: "Some gaps", color: "#9a6b19", bg: "#fff7e3" };
  return { label: "High friction risk", color: "#c93d56", bg: "#fff0f3" };
}

function AnswerControl({
  value,
  onChange,
}: {
  value: Answer;
  onChange: (value: Answer) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {answerOptions.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-20 rounded-lg border p-3 text-left transition ${
              selected
                ? "border-[#222] bg-[#222] text-white"
                : "border-[#dddddd] bg-white text-[#222] hover:border-[#717171]"
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span
              className={`mt-1 block text-xs leading-4 ${
                selected ? "text-white/70" : "text-[#717171]"
              }`}
            >
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ChinaReadyPass() {
  const [step, setStep] = useState(0);
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment);
  const [completed, setCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"solo" | "family">("solo");
  const [passView, setPassView] = useState<PassView>("overview");
  const [activeFix, setActiveFix] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("china-ready-pass-demo");
      if (saved) {
        try {
          const state = JSON.parse(saved) as {
            assessment?: Assessment;
            completed?: boolean;
            unlocked?: boolean;
          };
          if (state.assessment) setAssessment(state.assessment);
          if (state.completed) setCompleted(true);
          if (state.unlocked) setUnlocked(true);
        } catch {
          localStorage.removeItem("china-ready-pass-demo");
        }
      }
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function applyRoute(event: Event) {
      if (!(event instanceof CustomEvent)) return;
      const route = event.detail as { cities?: string[] };
      if (!Array.isArray(route.cities) || route.cities.length === 0) return;
      setAssessment((current) => ({ ...current, cities: route.cities!.slice(0, 4) }));
      setCompleted(false);
      setStep(0);
    }

    window.addEventListener("china-route-draft", applyRoute);
    return () => window.removeEventListener("china-route-draft", applyRoute);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(
      "china-ready-pass-demo",
      JSON.stringify({ assessment, completed, unlocked })
    );
  }, [assessment, completed, hasHydrated, unlocked]);

  const score = useMemo(() => calculateScore(assessment), [assessment]);
  const risks = useMemo(() => buildRisks(assessment), [assessment]);
  const tone = scoreTone(score);

  function update<K extends keyof Assessment>(key: K, value: Assessment[K]) {
    setAssessment((current) => ({ ...current, [key]: value }));
  }

  function toggleCity(city: string) {
    setAssessment((current) => {
      const hasCity = current.cities.includes(city);
      if (hasCity && current.cities.length === 1) return current;
      if (!hasCity && current.cities.length === 4) return current;
      return {
        ...current,
        cities: hasCity
          ? current.cities.filter((item) => item !== city)
          : [...current.cities, city],
      };
    });
  }

  function finishAssessment() {
    setCompleted(true);
    setStep(0);
  }

  function completeDemoCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUnlocked(true);
    setShowCheckout(false);
    setPassView("overview");
    setTimeout(() => {
      document.querySelector("#ready-pass-dashboard")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function resetDemo() {
    setAssessment(initialAssessment);
    setCompleted(false);
    setUnlocked(false);
    setStep(0);
    setPassView("overview");
    localStorage.removeItem("china-ready-pass-demo");
  }

  const steps = [
    {
      label: "Your trip",
      content: (
        <div>
          <h3 className="text-2xl font-bold text-[#222]">Tell us about the trip</h3>
          <p className="mt-2 text-sm leading-6 text-[#717171]">
            We use this to check timing, booking pressure, and the right setup path.
          </p>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#222]">
              Country or region
              <input
                value={assessment.country}
                onChange={(event) => update("country", event.target.value)}
                placeholder="United States"
                className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] px-4 font-normal outline-none focus:border-[#222]"
              />
            </label>
            <label className="text-sm font-semibold text-[#222]">
              Departure date
              <input
                type="date"
                value={assessment.departureDate}
                onChange={(event) => update("departureDate", event.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] px-4 font-normal outline-none focus:border-[#222]"
              />
            </label>
            <label className="text-sm font-semibold text-[#222]">
              Trip length
              <select
                value={assessment.tripLength}
                onChange={(event) => update("tripLength", event.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] bg-white px-4 font-normal outline-none focus:border-[#222]"
              >
                <option>3-7 days</option>
                <option>8-14 days</option>
                <option>15-21 days</option>
                <option>22+ days</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#222]">
              Traveling as
              <select
                value={assessment.travelers}
                onChange={(event) => update("travelers", event.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] bg-white px-4 font-normal outline-none focus:border-[#222]"
              >
                <option>Solo traveler</option>
                <option>Couple</option>
                <option>Family</option>
                <option>Friends</option>
              </select>
            </label>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-[#222]">Cities</legend>
            <p className="mt-1 text-xs text-[#717171]">Select up to four</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cityOptions.map((city) => {
                const selected = assessment.cities.includes(city);
                return (
                  <button
                    key={city}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCity(city)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-[#222] bg-[#222] text-white"
                        : "border-[#dddddd] bg-white text-[#484848] hover:border-[#222]"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      ),
    },
    {
      label: "Money & phone",
      content: (
        <div>
          <h3 className="text-2xl font-bold text-[#222]">Will your phone and money work?</h3>
          <p className="mt-2 text-sm leading-6 text-[#717171]">
            These two systems affect almost every part of a trip in China.
          </p>
          <label className="mt-7 block text-sm font-semibold text-[#222]">
            Your primary phone
            <select
              value={assessment.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] bg-white px-4 font-normal outline-none focus:border-[#222]"
            >
              <option>iPhone</option>
              <option>Android with Google Play</option>
              <option>Android without Google Play</option>
            </select>
          </label>
          <div className="mt-7 space-y-7">
            {assessmentAreas.slice(0, 2).map((area) => (
              <fieldset key={area.key}>
                <legend className="mb-3 flex items-center gap-3">
                  <area.icon className="h-5 w-5 text-[#FF385C]" />
                  <span>
                    <span className="block text-sm font-semibold text-[#222]">
                      {area.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-[#717171]">
                      {area.description}
                    </span>
                  </span>
                </legend>
                <AnswerControl
                  value={assessment[area.key]}
                  onChange={(value) => update(area.key, value)}
                />
              </fieldset>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Getting around",
      content: (
        <div>
          <h3 className="text-2xl font-bold text-[#222]">Can you move through China smoothly?</h3>
          <p className="mt-2 text-sm leading-6 text-[#717171]">
            We check arrival-day navigation, trains, and reservations separately.
          </p>
          <div className="mt-7 space-y-7">
            {assessmentAreas.slice(2).map((area) => (
              <fieldset key={area.key}>
                <legend className="mb-3 flex items-center gap-3">
                  <area.icon className="h-5 w-5 text-[#FF385C]" />
                  <span>
                    <span className="block text-sm font-semibold text-[#222]">
                      {area.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-[#717171]">
                      {area.description}
                    </span>
                  </span>
                </legend>
                <AnswerControl
                  value={assessment[area.key]}
                  onChange={(value) => update(area.key, value)}
                />
              </fieldset>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Personal needs",
      content: (
        <div>
          <h3 className="text-2xl font-bold text-[#222]">Make the pass useful on the ground</h3>
          <p className="mt-2 text-sm leading-6 text-[#717171]">
            Your offline cards will use this information in English and Chinese.
          </p>
          <label className="mt-7 block text-sm font-semibold text-[#222]">
            Dietary, medical, mobility, or family needs
            <textarea
              value={assessment.dietary}
              onChange={(event) => update("dietary", event.target.value)}
              rows={5}
              placeholder="Vegetarian, peanut allergy, traveling with a toddler..."
              className="mt-2 w-full resize-none rounded-lg border border-[#b0b0b0] px-4 py-3 font-normal leading-6 outline-none focus:border-[#222]"
            />
          </label>
          <div className="mt-6 rounded-lg border border-[#dce9e2] bg-[#f3faf6] p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#24835b]" />
              <div>
                <p className="text-sm font-semibold text-[#224b38]">Privacy by design</p>
                <p className="mt-1 text-xs leading-5 text-[#4c6c5c]">
                  This demo stores answers only in your browser. A production version
                  should encrypt account data and avoid storing passport or card numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const timeline = [
    {
      date: daysBefore(assessment.departureDate, 30),
      title: "Build your China app stack",
      detail: `Install the correct versions for ${assessment.phone} and complete identity checks.`,
      category: "Setup",
    },
    {
      date: daysBefore(assessment.departureDate, 21),
      title: "Test payment and connectivity",
      detail: "Confirm a primary route and a fallback before bookings become time-sensitive.",
      category: "Test",
    },
    {
      date: daysBefore(assessment.departureDate, 14),
      title: "Review train and attraction windows",
      detail: `Prioritize identity-linked reservations for ${assessment.cities.join(", ")}.`,
      category: "Book",
    },
    {
      date: daysBefore(assessment.departureDate, 7),
      title: "Save your offline arrival pack",
      detail: "Download addresses, booking references, emergency phrases, and backup instructions.",
      category: "Download",
    },
    {
      date: daysBefore(assessment.departureDate, 1),
      title: "Run the final five-minute check",
      detail: "Open every essential app once, screenshot key tickets, and charge your power bank.",
      category: "Final check",
    },
  ];

  return (
    <section id="readiness" className="scroll-mt-20 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#FF385C]">
              <Sparkles className="h-4 w-4" />
              FREE CHINA READINESS CHECK
            </div>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight text-[#222] md:text-5xl">
              Find the problems before they become travel problems.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#717171] md:text-lg">
              A five-minute check for payments, internet, bookings, transport, and
              language friction. Get your score and the exact gaps in your setup.
            </p>
          </div>
          <div className="grid grid-cols-3 border-y border-[#ebebeb] py-4 text-center lg:border-y-0 lg:border-l lg:py-2">
            <div>
              <strong className="block text-xl text-[#222]">5 min</strong>
              <span className="text-xs text-[#717171]">assessment</span>
            </div>
            <div>
              <strong className="block text-xl text-[#222]">$29</strong>
              <span className="text-xs text-[#717171]">one-time</span>
            </div>
            <div>
              <strong className="block text-xl text-[#222]">Offline</strong>
              <span className="text-xs text-[#717171]">ready</span>
            </div>
          </div>
        </div>

        {!completed ? (
          <div className="overflow-hidden rounded-2xl border border-[#dddddd] bg-[#fbfbfb] shadow-[0_18px_60px_rgba(34,34,34,0.07)]">
            <div className="grid lg:grid-cols-[270px_1fr]">
              <aside className="border-b border-[#ebebeb] bg-[#222] p-6 text-white lg:border-b-0 lg:p-8">
                <p className="text-xs font-semibold uppercase text-white/50">
                  Your readiness check
                </p>
                <div className="mt-7 grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-5">
                  {steps.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          index < step
                            ? "bg-[#39a775] text-white"
                            : index === step
                              ? "bg-white text-[#222]"
                              : "bg-white/10 text-white/50"
                        }`}
                      >
                        {index < step ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <span
                        className={`hidden text-sm lg:block ${
                          index === step ? "font-semibold text-white" : "text-white/55"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-9 hidden border-t border-white/10 pt-6 lg:block">
                  <p className="text-sm leading-6 text-white/60">
                    We score practical readiness, not travel experience. There are no
                    wrong answers.
                  </p>
                </div>
              </aside>

              <div className="p-6 md:p-10 lg:p-12">
                <div className="mx-auto max-w-3xl">{steps[step].content}</div>
                <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between border-t border-[#ebebeb] pt-6">
                  <button
                    type="button"
                    disabled={step === 0}
                    onClick={() => setStep((current) => current - 1)}
                    className="flex h-11 items-center gap-2 px-2 text-sm font-semibold text-[#484848] disabled:invisible"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((current) => current + 1)}
                      className="flex h-12 items-center gap-2 rounded-lg bg-[#FF385C] px-6 text-sm font-semibold text-white transition hover:bg-[#e31c5f]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finishAssessment}
                      className="flex h-12 items-center gap-2 rounded-lg bg-[#FF385C] px-6 text-sm font-semibold text-white transition hover:bg-[#e31c5f]"
                    >
                      Calculate my score
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-[itinerary-in_420ms_ease-out]">
            <div className="overflow-hidden rounded-2xl border border-[#dddddd] bg-white shadow-[0_18px_60px_rgba(34,34,34,0.07)]">
              <div className="grid lg:grid-cols-[330px_1fr]">
                <div className="border-b border-[#ebebeb] p-7 lg:border-b-0 lg:border-r lg:p-9">
                  <p className="text-xs font-semibold uppercase text-[#717171]">
                    Your China readiness score
                  </p>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-7xl font-bold tracking-tight text-[#222]">{score}</span>
                    <span className="mb-2 text-lg text-[#b0b0b0]">/100</span>
                  </div>
                  <div
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
                    style={{ color: tone.color, backgroundColor: tone.bg }}
                  >
                    <CircleAlert className="h-4 w-4" />
                    {tone.label}
                  </div>
                  <p className="mt-6 text-sm leading-6 text-[#717171]">
                    We found <strong className="text-[#222]">{risks.length} setup gaps</strong>{" "}
                    across your {assessment.tripLength.toLowerCase()} trip to{" "}
                    {assessment.cities.join(", ")}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCompleted(false)}
                    className="mt-6 text-sm font-semibold text-[#484848] underline underline-offset-4"
                  >
                    Change my answers
                  </button>
                </div>

                <div className="p-6 md:p-9">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#FF385C]">YOUR TOP RISKS</p>
                      <h3 className="mt-1 text-2xl font-bold text-[#222]">
                        Fix these before departure
                      </h3>
                    </div>
                    {unlocked && (
                      <span className="hidden items-center gap-2 text-sm font-semibold text-[#24835b] md:flex">
                        <BadgeCheck className="h-5 w-5" />
                        Pass unlocked
                      </span>
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    {(unlocked ? risks : risks.slice(0, 3)).map((risk) => (
                      <article
                        key={risk.id}
                        className="grid grid-cols-[42px_1fr] gap-4 rounded-lg border border-[#ebebeb] p-4 md:p-5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff0f3]">
                          <risk.icon className="h-5 w-5 text-[#c93d56]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-[#c93d56]">
                            {risk.area}
                          </p>
                          <h4 className="mt-1 font-semibold text-[#222]">{risk.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-[#717171]">{risk.detail}</p>
                          {unlocked && (
                            <p className="mt-3 flex gap-2 text-sm font-medium text-[#224b38]">
                              <Check className="mt-0.5 h-4 w-4 shrink-0" />
                              {risk.action}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  {!unlocked && (
                    <div className="relative mt-5 overflow-hidden rounded-xl border border-[#dddddd] bg-[#fafafa] p-6 md:p-8">
                      <div className="absolute right-5 top-5">
                        <LockKeyhole className="h-5 w-5 text-[#b0b0b0]" />
                      </div>
                      <p className="text-sm font-semibold text-[#FF385C]">CHINA READY PASS</p>
                      <h3 className="mt-2 max-w-xl text-2xl font-bold text-[#222]">
                        Turn your risk report into a complete departure plan.
                      </h3>
                      <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {[
                          "Device-specific app setup",
                          "Booking deadline timeline",
                          "Payment and internet test plan",
                          "Chinese address and needs cards",
                          "Offline emergency playbooks",
                          "30-day trip companion access",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-[#484848]">
                            <Check className="h-4 w-4 text-[#24835b]" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-7 flex flex-col gap-4 border-t border-[#ebebeb] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-3xl font-bold text-[#222]">$29</span>
                          <span className="ml-2 text-sm text-[#717171]">one-time · one trip</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCheckout(true)}
                          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#FF385C] px-6 text-sm font-semibold text-white transition hover:bg-[#e31c5f]"
                        >
                          Unlock my Ready Pass
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-[#717171]">
                        Demo checkout: no payment will be collected in this prototype.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {unlocked && (
              <div id="ready-pass-dashboard" className="scroll-mt-24 pt-12">
                <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#24835b]">PASS ACTIVE</p>
                    <h3 className="mt-1 text-3xl font-bold text-[#222]">
                      {assessment.travelers}&apos;s China Ready Pass
                    </h3>
                    <p className="mt-2 text-sm text-[#717171]">
                      {assessment.cities.join(" → ")} · {assessment.tripLength}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#222] px-5 text-sm font-semibold text-[#222] hover:bg-[#f7f7f7]"
                  >
                    <Download className="h-4 w-4" />
                    Save offline / Print
                  </button>
                </div>

                <div className="border-b border-[#dddddd]">
                  <div className="flex gap-7 overflow-x-auto">
                    {(
                      [
                        ["overview", "Action plan"],
                        ["timeline", "Timeline"],
                        ["cards", "Offline cards"],
                        ["fixes", "Problem solver"],
                      ] as [PassView, string][]
                    ).map(([view, label]) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setPassView(view)}
                        className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-semibold ${
                          passView === view
                            ? "border-[#222] text-[#222]"
                            : "border-transparent text-[#717171]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  {passView === "overview" && (
                    <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
                      <div className="space-y-3">
                        {risks.length > 0 ? (
                          risks.map((risk, index) => (
                            <article
                              key={risk.id}
                              className="flex gap-4 rounded-xl border border-[#ebebeb] bg-white p-5"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#222] text-xs font-bold text-white">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase text-[#717171]">
                                  {risk.area}
                                </p>
                                <h4 className="mt-1 font-semibold text-[#222]">{risk.action}</h4>
                                <p className="mt-2 text-sm leading-6 text-[#717171]">
                                  {risk.detail}
                                </p>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-xl border border-[#dce9e2] bg-[#f3faf6] p-7">
                            <BadgeCheck className="h-8 w-8 text-[#24835b]" />
                            <h4 className="mt-4 text-xl font-bold text-[#224b38]">
                              Your essential setup is ready
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-[#4c6c5c]">
                              Use the timeline for final checks and save the offline cards
                              before departure.
                            </p>
                          </div>
                        )}
                      </div>
                      <aside className="rounded-xl bg-[#222] p-6 text-white">
                        <Plane className="h-6 w-6 text-[#ff6b81]" />
                        <h4 className="mt-5 text-xl font-bold">Arrival-day checklist</h4>
                        <div className="mt-5 space-y-4">
                          {[
                            "Switch mobile data to your travel connection",
                            "Open payment and ride-hailing apps",
                            "Keep passport available for transport",
                            "Show the saved Chinese hotel card to your driver",
                          ].map((item) => (
                            <div key={item} className="flex gap-3 text-sm leading-5 text-white/75">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#65c896]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </aside>
                    </div>
                  )}

                  {passView === "timeline" && (
                    <div className="rounded-xl border border-[#ebebeb] bg-white p-5 md:p-8">
                      <div className="mb-7 flex items-center gap-3">
                        <CalendarClock className="h-6 w-6 text-[#FF385C]" />
                        <div>
                          <h4 className="text-xl font-bold text-[#222]">Your preparation timeline</h4>
                          <p className="text-sm text-[#717171]">
                            Generated from your departure date
                          </p>
                        </div>
                      </div>
                      <div className="space-y-0">
                        {timeline.map((item, index) => (
                          <article
                            key={item.title}
                            className="grid grid-cols-[76px_24px_1fr] gap-3 pb-7 last:pb-0 md:grid-cols-[110px_30px_1fr]"
                          >
                            <div className="pt-0.5 text-sm font-semibold text-[#484848]">
                              {item.date}
                            </div>
                            <div className="relative flex justify-center">
                              <div className="z-10 mt-1 h-3 w-3 rounded-full bg-[#FF385C]" />
                              {index < timeline.length - 1 && (
                                <div className="absolute bottom-[-28px] top-4 w-px bg-[#dddddd]" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-[#FF385C]">
                                {item.category}
                              </p>
                              <h5 className="mt-1 font-semibold text-[#222]">{item.title}</h5>
                              <p className="mt-1 text-sm leading-6 text-[#717171]">{item.detail}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {passView === "cards" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <article className="min-h-64 rounded-xl border border-[#dddddd] bg-white p-6">
                        <p className="text-xs font-semibold uppercase text-[#717171]">
                          Show your driver
                        </p>
                        <h4 className="mt-5 text-3xl font-bold leading-tight text-[#222]">
                          请送我到酒店正门
                        </h4>
                        <p className="mt-3 text-sm text-[#717171]">
                          Please take me to the main entrance of my hotel.
                        </p>
                        <div className="mt-7 border-t border-[#ebebeb] pt-5">
                          <p className="text-sm font-semibold text-[#222]">
                            我的手机没有网络，请帮我确认地址。
                          </p>
                          <p className="mt-1 text-xs text-[#717171]">
                            My phone has no internet. Please help me confirm the address.
                          </p>
                        </div>
                      </article>
                      <article className="min-h-64 rounded-xl bg-[#fff0f3] p-6">
                        <p className="text-xs font-semibold uppercase text-[#c93d56]">
                          Food & health
                        </p>
                        <h4 className="mt-5 text-2xl font-bold leading-tight text-[#222]">
                          我的饮食或健康需求
                        </h4>
                        <p className="mt-3 text-sm text-[#717171]">
                          My dietary or health requirements:
                        </p>
                        <p className="mt-6 rounded-lg bg-white p-4 text-lg font-semibold text-[#222]">
                          {assessment.dietary || "No special requirements"}
                        </p>
                      </article>
                      <article className="min-h-64 rounded-xl bg-[#222] p-6 text-white">
                        <p className="text-xs font-semibold uppercase text-white/50">
                          Train station help
                        </p>
                        <h4 className="mt-5 text-3xl font-bold leading-tight">
                          请问我的检票口在哪里？
                        </h4>
                        <p className="mt-3 text-sm text-white/60">
                          Where is the boarding gate for my train?
                        </p>
                        <p className="mt-8 text-lg font-semibold text-white">
                          我需要用护照取票吗？
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          Do I need to use my passport to collect the ticket?
                        </p>
                      </article>
                      <article className="min-h-64 rounded-xl border border-[#dce9e2] bg-[#f3faf6] p-6">
                        <p className="text-xs font-semibold uppercase text-[#24835b]">
                          Emergency
                        </p>
                        <h4 className="mt-5 text-3xl font-bold leading-tight text-[#224b38]">
                          我需要帮助
                        </h4>
                        <p className="mt-2 text-sm text-[#4c6c5c]">I need help.</p>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-white p-4">
                            <span className="block text-2xl font-bold text-[#222]">110</span>
                            <span className="text-xs text-[#717171]">Police</span>
                          </div>
                          <div className="rounded-lg bg-white p-4">
                            <span className="block text-2xl font-bold text-[#222]">120</span>
                            <span className="text-xs text-[#717171]">Ambulance</span>
                          </div>
                        </div>
                      </article>
                    </div>
                  )}

                  {passView === "fixes" && (
                    <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
                      <div className="space-y-2">
                        {troubleshooting.map((item, index) => (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setActiveFix(index)}
                            className={`flex w-full items-center justify-between rounded-lg border p-4 text-left text-sm font-semibold transition ${
                              activeFix === index
                                ? "border-[#222] bg-[#222] text-white"
                                : "border-[#dddddd] bg-white text-[#222] hover:border-[#717171]"
                            }`}
                          >
                            {item.title}
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          </button>
                        ))}
                      </div>
                      <article className="rounded-xl border border-[#ebebeb] bg-white p-6 md:p-8">
                        <div className="flex items-start gap-3">
                          <CircleAlert className="mt-0.5 h-6 w-6 shrink-0 text-[#FF385C]" />
                          <div>
                            <p className="text-xs font-bold uppercase text-[#FF385C]">
                              Step-by-step fix
                            </p>
                            <h4 className="mt-1 text-xl font-bold text-[#222]">
                              {troubleshooting[activeFix].title}
                            </h4>
                          </div>
                        </div>
                        <ol className="mt-7 space-y-5">
                          {troubleshooting[activeFix].steps.map((item, index) => (
                            <li key={item} className="flex gap-4 text-sm leading-6 text-[#484848]">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f7f7f7] text-xs font-bold text-[#222]">
                                {index + 1}
                              </span>
                              {item}
                            </li>
                          ))}
                        </ol>
                      </article>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={resetDemo}
                className="text-xs font-medium text-[#717171] underline underline-offset-4"
              >
                Reset product demo
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-6"
        >
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl md:max-w-lg md:rounded-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#FF385C]">DEMO CHECKOUT</p>
                <h3 id="checkout-title" className="mt-1 text-2xl font-bold text-[#222]">
                  Unlock your China Ready Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                aria-label="Close checkout"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f7f7f7]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("solo")}
                className={`rounded-lg border p-4 text-left ${
                  selectedPlan === "solo"
                    ? "border-[#222] bg-[#f7f7f7]"
                    : "border-[#dddddd]"
                }`}
              >
                <span className="block text-sm font-semibold text-[#222]">Solo / Couple</span>
                <span className="mt-2 block text-2xl font-bold text-[#222]">$29</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan("family")}
                className={`rounded-lg border p-4 text-left ${
                  selectedPlan === "family"
                    ? "border-[#222] bg-[#f7f7f7]"
                    : "border-[#dddddd]"
                }`}
              >
                <span className="block text-sm font-semibold text-[#222]">Family Pass</span>
                <span className="mt-2 block text-2xl font-bold text-[#222]">$49</span>
              </button>
            </div>

            <form onSubmit={completeDemoCheckout} className="mt-6">
              <label className="text-sm font-semibold text-[#222]">
                Delivery email
                <input
                  type="email"
                  required
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-lg border border-[#b0b0b0] px-4 font-normal outline-none focus:border-[#222]"
                />
              </label>
              <div className="mt-6 flex items-center justify-between border-y border-[#ebebeb] py-4">
                <span className="text-sm text-[#717171]">One-time purchase</span>
                <span className="text-lg font-bold text-[#222]">
                  ${selectedPlan === "solo" ? "29" : "49"}
                </span>
              </div>
              <button
                type="submit"
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF385C] text-sm font-semibold text-white hover:bg-[#e31c5f]"
              >
                Preview unlocked product
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-[#717171]">
                No card details or payment are collected. Connect this action to Stripe
                Checkout before launch.
              </p>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
