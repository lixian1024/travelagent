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

const stages = [
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

const contextSignals = [
  { label: "Current location", value: "East Gate, Temple of Heaven", icon: MapPin },
  { label: "Today", value: "Temple → Qianmen → Acrobatics", icon: Navigation },
  { label: "Travel setup", value: "iPhone · eSIM · Alipay", icon: Smartphone },
  { label: "Personal needs", value: "Peanut allergy · low spice", icon: Utensils },
  { label: "Verified before flight", value: "4 of 5 systems tested", icon: ShieldCheck },
  { label: "Local service layer", value: "Tickets · transit · guides", icon: UserRoundCheck },
];

export function JourneySection() {
  return (
    <section id="journey" className="scroll-mt-20 bg-paper px-5 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 border-b border-ink/15 pb-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="section-kicker">One continuous journey / 01</p>
            <h2 className="max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.045em] text-ink md:text-7xl">
              From “will it work?” to
              <span className="text-cinnabar"> “what now?”</span>
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

export function ContextAndServicesSection() {
  return (
    <>
      <section id="context" className="scroll-mt-20 overflow-hidden bg-ink px-5 py-20 text-white md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-kicker !text-[#f1dfbd]">The context advantage / 03</p>
              <h2 className="mt-6 max-w-3xl font-display text-5xl font-black leading-[0.94] tracking-[-0.045em] md:text-7xl">
                Translation is a feature.
                <span className="block text-[#f1dfbd]">Memory is the product.</span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/55">
                A general model can explain a menu. Your travel agent knows whether that
                menu fits your allergy, your schedule, your budget, and the train you need
                to catch in ninety minutes.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  [Camera, "What you see"],
                  [MapPin, "Where you are"],
                  [Clock3, "What comes next"],
                  [CircleUserRound, "Who you travel with"],
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
                      Persistent trip graph
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold">Context, not chat history</p>
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
                    Agent inference
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Leave lunch by 14:10. The south entrance saves 18 minutes and avoids
                    stairs before your 15:30 booking.
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
              <p className="section-kicker">China-ready capabilities / 04</p>
              <h2 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-[-0.045em] text-ink md:text-6xl">
                One agent for the systems you actually use in China.
              </h2>
              <p className="mt-6 text-base leading-7 text-ink/60">
                This is the agent&apos;s local action layer: the practical capabilities
                behind each answer, from diagnosing Alipay and eSIM issues to opening a
                destination in Didi or matching a verified guide.
              </p>
            </div>
            <div className="grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
              {[
                [WalletCards, "Payment", "QR type, card linkage, fallback cash"],
                [Wifi, "Connectivity", "eSIM, roaming, network diagnostics"],
                [Navigation, "Mobility", "Didi pickup, metro, train stations"],
                [Languages, "Language", "Menus, signs, driver-ready Chinese"],
                [ScanLine, "Vision", "Tickets, entrances, road signs, receipts"],
                [UserRoundCheck, "People", "Verified guides and urgent local help"],
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

export function HumanGuideSection() {
  return (
    <section id="guides" className="scroll-mt-20 bg-[#e44e33] px-5 py-20 text-white md:px-10 md:py-28 lg:px-16">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="section-kicker !text-white/60">Human handoff / 05</p>
          <h2 className="mt-5 max-w-3xl font-display text-5xl font-black leading-[0.93] tracking-[-0.045em] md:text-7xl">
            Some moments need a local, not a longer prompt.
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/70">
            When the agent detects deep interpretation, complex logistics, family care or
            disruption, it turns intent into a qualified guide lead, with the traveler&apos;s
            permission and context attached.
          </p>
        </div>

        <div className="border border-white/25 bg-[#f5e7d0] p-5 text-ink shadow-[18px_22px_0_rgba(19,18,15,0.18)] md:p-8">
          <div className="flex items-start justify-between border-b border-ink/15 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Agent recommendation</p>
                <p className="mt-1 text-[10px] font-semibold text-ink/45">Based on tomorrow&apos;s plan</p>
              </div>
            </div>
            <span className="bg-[#dbe2d2] px-2 py-1 text-[9px] font-bold uppercase text-[#34735a]">
              Good match
            </span>
          </div>

          <p className="mt-7 font-display text-2xl font-bold leading-snug">
            “This question is better handled by a local. Would you like an English guide
            for the Forbidden City tomorrow?”
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            <div className="border border-ink/15 bg-white p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink/35">Matched for</p>
              <p className="mt-2 text-xs font-bold">History · low walking pace</p>
            </div>
            <div className="border border-ink/15 bg-white p-4">
              <p className="text-[9px] font-bold uppercase tracking-wider text-ink/35">Available</p>
              <p className="mt-2 text-xs font-bold">Tomorrow · 09:00 · 4 hours</p>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-between bg-ink p-4 text-left text-xs font-bold text-white transition hover:bg-[#34342f]">
            See 3 matched local guides
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-center text-[10px] leading-4 text-ink/40">
            Your itinerary and accessibility preferences are only shared after approval.
          </p>
        </div>
      </div>
    </section>
  );
}
