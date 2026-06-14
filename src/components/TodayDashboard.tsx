"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CloudSun,
  Compass,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Ticket,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { AuthUser } from "@/components/TravelAgentApp";
import { createClient } from "@/lib/supabase/client";

type TripContext = {
  trip_days: number;
  traveler_count: number;
  cities: string[];
  food_needs: string[];
  spice_level: string;
};

type ItineraryItem = {
  id: string;
  scheduled_at: string;
  city: string;
  title: string;
  location: string;
  category: "transport" | "attraction" | "food" | "hotel" | "activity";
  notes: string;
  status: "planned" | "done" | "skipped";
};

type LocalContext = {
  city: string;
  timezone: string;
  weather: null | {
    temperature: number;
    apparentTemperature: number;
    condition: string;
    code: number;
  };
};

const cityGuides: Record<
  string,
  {
    mark: string;
    sights: Array<{ name: string; reason: string }>;
    foods: Array<{ name: string; reason: string }>;
  }
> = {
  beijing: {
    mark: "京",
    sights: [
      { name: "Temple of Heaven", reason: "Best before the tour groups and midday heat." },
      { name: "Jingshan Park", reason: "The clearest central view of the Forbidden City." },
      { name: "Shichahai hutongs", reason: "A flexible walk that works without a timed ticket." },
    ],
    foods: [
      { name: "Copper-pot hotpot", reason: "Classic sesame-dip lamb; easy to order for a group." },
      { name: "Zhajiangmian", reason: "Fast Beijing noodles for a low-friction lunch." },
      { name: "Peking duck", reason: "Book ahead and show dietary needs before ordering." },
    ],
  },
  shanghai: {
    mark: "沪",
    sights: [
      { name: "The Bund", reason: "Go around blue hour for both daylight and skyline lights." },
      { name: "Former French Concession", reason: "A weather-flexible area for walking, cafés, and shops." },
      { name: "Shanghai Museum East", reason: "A strong indoor choice for rain or afternoon heat." },
    ],
    foods: [
      { name: "Xiaolongbao", reason: "Eat carefully: the soup inside is very hot." },
      { name: "Shengjian mantou", reason: "A quick local breakfast or snack with crisp bottoms." },
      { name: "Scallion oil noodles", reason: "Simple, affordable, and easy to request without spice." },
    ],
  },
  "xi'an": {
    mark: "安",
    sights: [
      { name: "Terracotta Army", reason: "Start early; transit and the museum take most of a half-day." },
      { name: "City Wall", reason: "Late afternoon gives cooler temperatures and softer light." },
      { name: "Shaanxi History Museum", reason: "Excellent context before exploring the old capital." },
    ],
    foods: [
      { name: "Biangbiang noodles", reason: "Wide noodles; ask separately for chili oil." },
      { name: "Roujiamo", reason: "A portable local sandwich for a busy sightseeing day." },
      { name: "Yangrou paomo", reason: "A filling lamb soup experience unique to the city." },
    ],
  },
  chengdu: {
    mark: "蓉",
    sights: [
      { name: "Panda Base", reason: "Arrive at opening time when pandas are most active." },
      { name: "Wenshu Monastery", reason: "A calm central stop with tea and vegetarian food nearby." },
      { name: "People's Park", reason: "A low-planning way to experience Chengdu tea culture." },
    ],
    foods: [
      { name: "Hotpot", reason: "Choose a split pot and state spice and allergy needs clearly." },
      { name: "Dan dan noodles", reason: "Small portions make it easy to sample alongside other dishes." },
      { name: "Zhong dumplings", reason: "Sweet-spicy sauce; request no chili if needed." },
    ],
  },
  hangzhou: {
    mark: "杭",
    sights: [
      { name: "West Lake", reason: "Walk or cycle early before the busiest lakeside hours." },
      { name: "Lingyin Temple", reason: "A half-day of temples, forest paths, and carved grottoes." },
      { name: "Longjing village", reason: "Tea fields and tastings work best in clear weather." },
    ],
    foods: [
      { name: "West Lake vinegar fish", reason: "The city's signature sweet-sour fish dish." },
      { name: "Dongpo pork", reason: "Rich braised pork best shared with rice and vegetables." },
      { name: "Congbaohui", reason: "A crisp scallion pancake snack for a quick break." },
    ],
  },
  guangzhou: {
    mark: "穗",
    sights: [
      { name: "Chen Clan Ancestral Hall", reason: "A compact introduction to Cantonese craft and architecture." },
      { name: "Shamian Island", reason: "An easy shaded walk with historic buildings." },
      { name: "Canton Tower riverside", reason: "Go near sunset for skyline and Pearl River views." },
    ],
    foods: [
      { name: "Dim sum", reason: "Go in the morning and order several small dishes to share." },
      { name: "Roast goose", reason: "A Cantonese classic; popular shops may sell out." },
      { name: "Wonton noodles", reason: "A fast, mild meal that is easy to customize." },
    ],
  },
  shenzhen: {
    mark: "深",
    sights: [
      { name: "Dafen Oil Painting Village", reason: "A distinctive creative district that works in mixed weather." },
      { name: "OCT Loft", reason: "Galleries, cafés, and design shops in a walkable area." },
      { name: "Shenzhen Bay Park", reason: "Best toward sunset when the heat drops." },
    ],
    foods: [
      { name: "Cantonese dim sum", reason: "A reliable group breakfast with many mild choices." },
      { name: "Coconut chicken hotpot", reason: "Light broth and easy spice control." },
      { name: "Chaoshan beef hotpot", reason: "Fresh sliced beef with customizable dipping sauces." },
    ],
  },
  guilin: {
    mark: "桂",
    sights: [
      { name: "Li River cruise", reason: "Prioritize this on the clearest day in your schedule." },
      { name: "Reed Flute Cave", reason: "A dependable indoor option during rain or heat." },
      { name: "Elephant Trunk Hill", reason: "A central, low-effort introduction to the karst landscape." },
    ],
    foods: [
      { name: "Guilin rice noodles", reason: "The essential quick breakfast; add chili separately." },
      { name: "Beer fish", reason: "A Yangshuo specialty suited to sharing." },
      { name: "Oil tea", reason: "A distinctive local flavor that can be bitter and savory." },
    ],
  },
};

const categoryIcons = {
  transport: ArrowRight,
  attraction: Compass,
  food: Utensils,
  hotel: MapPin,
  activity: Ticket,
};

function normalizeCity(value: string) {
  return value.trim().toLowerCase().replace(" city", "");
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function emptyDraft(city: string) {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  return {
    id: "",
    date: localDateKey(now),
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    city,
    title: "",
    location: "",
    category: "attraction" as ItineraryItem["category"],
    notes: "",
  };
}

export default function TodayDashboard({
  authConfigured,
  user,
  openAgent,
}: {
  authConfigured: boolean;
  user: AuthUser | null;
  openAgent: () => void;
}) {
  const [tripContext, setTripContext] = useState<TripContext | null>(null);
  const [startDate, setStartDate] = useState("");
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [local, setLocal] = useState<LocalContext | null>(null);
  const [loading, setLoading] = useState(Boolean(authConfigured && user));
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft("Beijing"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const now = new Date();

  useEffect(() => {
    if (!authConfigured || !user) return;

    const supabase = createClient();
    void Promise.all([
      supabase
        .from("trip_contexts")
        .select("trip_days, traveler_count, cities, food_needs, spice_level")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("trip_plans").select("start_date").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("trip_itinerary_items")
        .select("id, scheduled_at, city, title, location, category, notes, status")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: true }),
    ]).then(([contextResult, planResult, itemsResult]) => {
      if (contextResult.data) setTripContext(contextResult.data as TripContext);
      if (planResult.data?.start_date) setStartDate(planResult.data.start_date);
      if (itemsResult.data) setItems(itemsResult.data as ItineraryItem[]);
      if (contextResult.error || planResult.error || itemsResult.error) {
        setError("Some trip details could not be loaded.");
      }
      setLoading(false);
    });
  }, [authConfigured, user]);

  const fallbackCity = tripContext?.cities?.[0] || "Beijing";

  useEffect(() => {
    let cancelled = false;

    async function loadLocal(latitude?: number, longitude?: number) {
      const params = new URLSearchParams({ city: fallbackCity });
      if (latitude !== undefined && longitude !== undefined) {
        params.set("lat", String(latitude));
        params.set("lon", String(longitude));
      }
      const response = await fetch(`/api/today/local?${params}`, { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as LocalContext;
      if (!cancelled) setLocal(data);
    }

    if (!("geolocation" in navigator)) {
      void loadLocal();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void loadLocal(coords.latitude, coords.longitude),
      () => void loadLocal(),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    );

    return () => {
      cancelled = true;
    };
  }, [fallbackCity]);

  const city = local?.city || fallbackCity;
  const guide =
    cityGuides[normalizeCity(city)] ||
    cityGuides[normalizeCity(fallbackCity)] || {
      mark: "中",
      sights: [
        { name: `${city} old town or central landmark`, reason: "A reliable first stop for local context." },
        { name: "City museum", reason: "A weather-proof way to understand the destination." },
        { name: "Riverside or central park", reason: "A flexible choice without advance booking." },
      ],
      foods: [
        { name: "Local breakfast specialty", reason: "Ask the hotel for one nearby place locals use." },
        { name: "Regional noodles", reason: "Fast, affordable, and easy to customize." },
        { name: "Night market snacks", reason: "Sample small portions and check allergens first." },
      ],
    };

  const todayKey = localDateKey(now);
  const todayItems = items.filter(
    (item) => localDateKey(new Date(item.scheduled_at)) === todayKey && item.status !== "skipped",
  );
  const nextItem =
    todayItems.find(
      (item) => item.status === "planned" && new Date(item.scheduled_at).getTime() >= now.getTime() - 30 * 60 * 1000,
    ) || items.find((item) => item.status === "planned" && new Date(item.scheduled_at) > now);
  const dayNumber = startDate
    ? Math.max(
        1,
        Math.floor((new Date(todayKey).getTime() - new Date(startDate).getTime()) / 86400000) + 1,
      )
    : null;
  const dayLabel =
    dayNumber && tripContext?.trip_days
      ? `Day ${Math.min(dayNumber, tripContext.trip_days)} of ${tripContext.trip_days}`
      : tripContext?.trip_days
        ? `${tripContext.trip_days}-day trip`
        : "Live trip";
  const nextAction = nextItem
    ? {
        title: nextItem.title,
        detail:
          nextItem.notes ||
          `${nextItem.location || nextItem.city} · ${new Date(nextItem.scheduled_at).toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" },
          )}`,
        label:
          new Date(nextItem.scheduled_at).getTime() <= now.getTime()
            ? "Do this now"
            : `At ${new Date(nextItem.scheduled_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
      }
    : {
        title: `Start with ${guide.sights[0].name}.`,
        detail: `${guide.sights[0].reason} This suggestion uses your current city because no detailed plan is scheduled next.`,
        label: "Suggested nearby",
      };

  const displayName = user?.name?.split(" ")[0] || "traveler";
  const foodNote = tripContext?.food_needs?.filter((need) => need !== "No restrictions").join(", ");

  function openNewItem() {
    setDraft(emptyDraft(city));
    setEditorOpen(true);
    setError("");
  }

  function editItem(item: ItineraryItem) {
    const scheduled = new Date(item.scheduled_at);
    setDraft({
      id: item.id,
      date: localDateKey(scheduled),
      time: `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
      city: item.city,
      title: item.title,
      location: item.location,
      category: item.category,
      notes: item.notes,
    });
    setEditorOpen(true);
  }

  async function saveItem(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    const supabase = createClient();
    const scheduledAt = new Date(`${draft.date}T${draft.time}:00`).toISOString();
    const payload = {
      user_id: user.id,
      scheduled_at: scheduledAt,
      city: draft.city.trim(),
      title: draft.title.trim(),
      location: draft.location.trim(),
      category: draft.category,
      notes: draft.notes.trim(),
      updated_at: new Date().toISOString(),
    };
    const result = draft.id
      ? await supabase
          .from("trip_itinerary_items")
          .update(payload)
          .eq("id", draft.id)
          .eq("user_id", user.id)
          .select("id, scheduled_at, city, title, location, category, notes, status")
          .single()
      : await supabase
          .from("trip_itinerary_items")
          .insert(payload)
          .select("id, scheduled_at, city, title, location, category, notes, status")
          .single();

    if (result.error || !result.data) {
      setError("Could not save this plan item.");
    } else {
      setItems((current) =>
        [...current.filter((item) => item.id !== result.data.id), result.data as ItineraryItem].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        ),
      );
      setEditorOpen(false);
    }
    setSaving(false);
  }

  async function saveStartDate(value: string) {
    setStartDate(value);
    if (!user) return;
    const supabase = createClient();
    await supabase.from("trip_plans").upsert(
      {
        user_id: user.id,
        start_date: value || null,
        timezone: local?.timezone || "Asia/Shanghai",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  async function updateStatus(item: ItineraryItem, status: ItineraryItem["status"]) {
    if (!user) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("trip_itinerary_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("user_id", user.id);
    if (!updateError) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, status } : currentItem,
        ),
      );
    }
  }

  async function deleteItem() {
    if (!user || !draft.id) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("trip_itinerary_items")
      .delete()
      .eq("id", draft.id)
      .eq("user_id", user.id);
    if (!deleteError) {
      setItems((current) => current.filter((item) => item.id !== draft.id));
      setEditorOpen(false);
    }
  }

  if (!authConfigured || !user) {
    return (
      <div className="border border-ink/15 bg-white p-6 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-cinnabar" />
        <p className="mt-3 text-sm font-bold">Sign in to build your live travel day.</p>
      </div>
    );
  }

  return (
    <div className="screen-in space-y-5 pb-4">
      <section className="relative overflow-hidden bg-ink p-5 text-white">
        <div className="absolute -right-5 -top-14 font-display text-[9rem] font-black text-white/[0.04]">
          {guide.mark}
        </div>
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            {now.toLocaleDateString("en-US", { weekday: "long" })} · {city} · {dayLabel}
          </p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/55">
                {greetingForHour(now.getHours())}, {displayName}.
              </p>
              <h1 className="mt-2 font-display text-4xl font-black leading-[0.95] tracking-tight">
                Your next move
                <br />
                is ready.
              </h1>
            </div>
            <span className="mt-1 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-cinnabar">
              {local?.weather ? (
                <>
                  <strong className="text-sm">{local.weather.temperature}°</strong>
                  <CloudSun className="mt-0.5 h-3 w-3" />
                </>
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
            </span>
          </div>
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
            <span className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#f1dfbd]" />
              <span>
                <span className="block text-[9px] uppercase tracking-wider text-white/35">
                  Current city
                </span>
                <span className="mt-1 block text-xs font-bold">{city}</span>
              </span>
            </span>
            <span className="text-right text-[9px] leading-4 text-white/45">
              {local?.weather?.condition || "Checking weather"}
              {local?.weather ? ` · feels ${local.weather.apparentTemperature}°` : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="border border-ink/15 bg-[#f1dfbd] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/45">
            Next best action
          </p>
          <span className="text-[10px] font-bold text-cinnabar">{nextAction.label}</span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-black text-ink">{nextAction.title}</h2>
        <p className="mt-2 text-xs leading-5 text-ink/55">{nextAction.detail}</p>
        <button
          type="button"
          onClick={openAgent}
          className="mt-5 flex w-full items-center justify-between bg-ink p-4 text-left text-xs font-bold text-white"
        >
          Ask Agent to guide me
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
              Worth your time in {city}
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">See & eat</h2>
          </div>
          <Sparkles className="h-5 w-5 text-cinnabar" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-ink/15 bg-white p-4">
            <Compass className="h-5 w-5 text-cinnabar" />
            <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-ink/35">
              Best first sight
            </p>
            <p className="mt-2 text-sm font-black">{guide.sights[0].name}</p>
            <p className="mt-2 text-[9px] leading-4 text-ink/45">{guide.sights[0].reason}</p>
          </div>
          <div className="border border-ink/15 bg-[#dbe2d2] p-4">
            <Utensils className="h-5 w-5 text-[#34735a]" />
            <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-ink/35">
              Local food pick
            </p>
            <p className="mt-2 text-sm font-black">{guide.foods[0].name}</p>
            <p className="mt-2 text-[9px] leading-4 text-ink/45">{guide.foods[0].reason}</p>
          </div>
        </div>
        {foodNote && (
          <p className="mt-2 border border-cinnabar/15 bg-[#fff3ed] p-3 text-[9px] leading-4 text-ink/50">
            Food suggestions should respect: <strong>{foodNote}</strong> · {tripContext?.spice_level} spice.
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink/40">
              Detailed itinerary
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-ink">Today timeline</h2>
          </div>
          <button
            type="button"
            onClick={openNewItem}
            className="flex items-center gap-1.5 text-[10px] font-bold text-cinnabar"
          >
            <Plus className="h-3.5 w-3.5" />
            Add plan
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between border border-ink/15 bg-white p-3">
          <span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-ink/35">
              Trip starts
            </span>
            <span className="mt-1 block text-[10px] text-ink/45">
              Used to calculate Day 1, Day 2, and later.
            </span>
          </span>
          <input
            aria-label="Trip start date"
            type="date"
            value={startDate}
            onChange={(event) => void saveStartDate(event.target.value)}
            className="border border-ink/15 bg-paper px-2 py-2 text-[10px] font-bold outline-none"
          />
        </div>

        <div className="border border-ink/15 bg-white">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <LoaderCircle className="h-5 w-5 animate-spin text-cinnabar" />
            </div>
          ) : todayItems.length === 0 ? (
            <button type="button" onClick={openNewItem} className="w-full p-6 text-left">
              <CalendarDays className="h-5 w-5 text-cinnabar" />
              <p className="mt-3 text-sm font-bold">No fixed plan today.</p>
              <p className="mt-1 text-[10px] leading-5 text-ink/45">
                That is okay. Add only reservations, transport, or time-sensitive activities.
                Recommendations fill the rest.
              </p>
            </button>
          ) : (
            todayItems.map((item, index) => {
              const ItemIcon = categoryIcons[item.category];
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[46px_32px_1fr_auto] gap-3 p-4 ${
                    index !== todayItems.length - 1 ? "border-b border-ink/10" : ""
                  } ${item.status === "done" ? "opacity-45" : ""}`}
                >
                  <span className="pt-1 font-mono text-[10px] font-bold text-ink/35">
                    {new Date(item.scheduled_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-cinnabar">
                    <ItemIcon className="h-3.5 w-3.5" />
                  </span>
                  <button type="button" onClick={() => editItem(item)} className="min-w-0 text-left">
                    <span className="block truncate text-xs font-bold">{item.title}</span>
                    <span className="mt-1 block truncate text-[9px] text-ink/40">
                      {item.location || item.city}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={item.status === "done" ? "Mark planned" : "Mark done"}
                    onClick={() => void updateStatus(item, item.status === "done" ? "planned" : "done")}
                    className={`flex h-7 w-7 items-center justify-center border ${
                      item.status === "done"
                        ? "border-[#34735a] bg-[#34735a] text-white"
                        : "border-ink/15 text-ink/30"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {error && (
        <p className="border border-cinnabar/20 bg-[#fff3ed] p-3 text-[10px] text-cinnabar">
          {error}
        </p>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm">
          <form
            onSubmit={saveItem}
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto bg-paper p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cinnabar">
                  {draft.id ? "Edit itinerary item" : "Add to itinerary"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-black">Plan what matters</h2>
              </div>
              <button type="button" aria-label="Close editor" onClick={() => setEditorOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink/40">
                Date
                <input
                  required
                  type="date"
                  value={draft.date}
                  onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                  className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-base font-bold text-ink outline-none"
                />
              </label>
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink/40">
                Time
                <input
                  required
                  type="time"
                  value={draft.time}
                  onChange={(event) => setDraft({ ...draft, time: event.target.value })}
                  className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-base font-bold text-ink outline-none"
                />
              </label>
            </div>

            <label className="mt-4 block text-[9px] font-bold uppercase tracking-wider text-ink/40">
              What are you doing?
              <input
                required
                maxLength={160}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Forbidden City timed entry"
                className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-xs normal-case tracking-normal text-ink outline-none"
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink/40">
                City
                <input
                  required
                  maxLength={100}
                  value={draft.city}
                  onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                  className="mt-2 min-h-11 w-full border border-ink/15 bg-white px-3 text-xs normal-case tracking-normal text-ink outline-none"
                />
              </label>
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink/40">
                Type
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      category: event.target.value as ItineraryItem["category"],
                    })
                  }
                  className="mt-2 min-h-12 w-full border border-ink/15 bg-white px-3 text-base font-bold normal-case tracking-normal text-ink outline-none"
                >
                  <option value="attraction">Attraction</option>
                  <option value="transport">Transport</option>
                  <option value="food">Food</option>
                  <option value="hotel">Hotel</option>
                  <option value="activity">Activity</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block text-[9px] font-bold uppercase tracking-wider text-ink/40">
              Exact place
              <input
                maxLength={240}
                value={draft.location}
                onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                placeholder="Entrance, station, restaurant, or hotel"
                className="mt-2 min-h-11 w-full border border-ink/15 bg-white px-3 text-xs normal-case tracking-normal text-ink outline-none"
              />
            </label>

            <label className="mt-4 block text-[9px] font-bold uppercase tracking-wider text-ink/40">
              Useful detail
              <textarea
                maxLength={1000}
                rows={3}
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="Ticket rule, booking number hint, entrance, or when to leave"
                className="mt-2 w-full resize-none border border-ink/15 bg-white p-3 text-xs normal-case leading-5 tracking-normal text-ink outline-none"
              />
            </label>

            <div className="mt-5 flex gap-2">
              {draft.id && (
                <button
                  type="button"
                  aria-label="Delete itinerary item"
                  onClick={() => void deleteItem()}
                  className="flex h-12 w-12 items-center justify-center border border-cinnabar/25 text-cinnabar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex h-12 flex-1 items-center justify-between bg-ink px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : draft.id ? "Save changes" : "Add to plan"}
                {draft.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
