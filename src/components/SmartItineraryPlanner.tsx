"use client";

import { useMemo, useState } from "react";

type Pace = "relaxed" | "balanced" | "packed";
type Budget = "smart" | "comfort" | "premium";

type CityProfile = {
  name: string;
  code: string;
  color: string;
  highlights: string[];
  food: string[];
  evening: string[];
  tip: string;
};

type ItineraryDay = {
  day: number;
  city: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  note?: string;
};

const cities: CityProfile[] = [
  {
    name: "Beijing",
    code: "PEK",
    color: "#d85a47",
    highlights: [
      "Forbidden City and Jingshan Park",
      "Mutianyu Great Wall",
      "Temple of Heaven and old hutongs",
      "Summer Palace lakeside walk",
    ],
    food: ["Peking duck", "hutong dumplings", "traditional hot pot"],
    evening: ["Houhai lakeside walk", "Qianmen night stroll", "a relaxed tea house"],
    tip: "Carry your passport for major attractions and reserve the Forbidden City in advance.",
  },
  {
    name: "Shanghai",
    code: "SHA",
    color: "#357c78",
    highlights: [
      "The Bund and historic architecture",
      "French Concession lanes",
      "Yu Garden and Old City",
      "West Bund art district",
    ],
    food: ["xiaolongbao", "Shanghainese noodles", "a modern Chinese tasting menu"],
    evening: ["the Bund after dark", "a rooftop view in Lujiazui", "a jazz bar"],
    tip: "Use the metro for most trips and save the Chinese address of your hotel.",
  },
  {
    name: "Xi'an",
    code: "XIY",
    color: "#9a6b36",
    highlights: [
      "Terracotta Warriors",
      "Ancient City Wall by bicycle",
      "Big Wild Goose Pagoda",
      "Shaanxi History Museum",
    ],
    food: ["biangbiang noodles", "roujiamo", "Muslim Quarter snacks"],
    evening: ["Datang Everbright City", "the illuminated City Wall", "a local shadow-puppet show"],
    tip: "The Terracotta Warriors are outside the city, so keep half a day free for the visit.",
  },
  {
    name: "Chengdu",
    code: "CTU",
    color: "#54864a",
    highlights: [
      "Chengdu Research Base of Giant Panda Breeding",
      "People's Park and a local tea house",
      "Wuhou Shrine and Jinli Street",
      "Kuanzhai Alley and neighborhood lanes",
    ],
    food: ["Sichuan hot pot", "dan dan noodles", "mapo tofu"],
    evening: ["a Sichuan opera face-changing show", "Jiuyan Bridge", "a neighborhood tea house"],
    tip: "Visit the panda base early in the morning when the pandas are most active.",
  },
  {
    name: "Hangzhou",
    code: "HGH",
    color: "#557b9a",
    highlights: [
      "West Lake scenic walk",
      "Lingyin Temple",
      "Longjing tea village",
      "Grand Canal historic district",
    ],
    food: ["West Lake fish", "Dongpo pork", "Longjing tea dishes"],
    evening: ["West Lake sunset", "a lakeside performance", "Hefang Street"],
    tip: "Rent a shared bicycle for the quiet northern and western sides of West Lake.",
  },
  {
    name: "Guilin",
    code: "KWL",
    color: "#4d806c",
    highlights: [
      "Li River cruise to Yangshuo",
      "Longji Rice Terraces",
      "Yulong River countryside",
      "Reed Flute Cave",
    ],
    food: ["Guilin rice noodles", "beer fish", "stuffed river snails"],
    evening: ["Two Rivers and Four Lakes", "West Street in Yangshuo", "a riverside walk"],
    tip: "Keep one flexible day because river and countryside plans can be weather dependent.",
  },
];

const interests = ["History", "Food", "Nature", "Local life", "Art", "Photography"];

function buildItinerary(
  selectedCities: string[],
  days: number,
  selectedInterests: string[],
  pace: Pace
) {
  const result: ItineraryDay[] = [];
  const cityCount = selectedCities.length;
  const baseDays = Math.floor(days / cityCount);
  let remainingDays = days % cityCount;
  let dayNumber = 1;

  selectedCities.forEach((cityName, cityIndex) => {
    const city = cities.find((item) => item.name === cityName) ?? cities[0];
    const daysHere = baseDays + (remainingDays > 0 ? 1 : 0);
    remainingDays = Math.max(0, remainingDays - 1);

    for (let localDay = 0; localDay < daysHere; localDay += 1) {
      const highlightIndex = (localDay + selectedInterests.length) % city.highlights.length;
      const secondHighlight = city.highlights[(highlightIndex + 1) % city.highlights.length];
      const isTransfer = cityIndex > 0 && localDay === 0;
      const food = city.food[(localDay + cityIndex) % city.food.length];

      result.push({
        day: dayNumber,
        city: city.name,
        title: isTransfer
          ? `Arrive and settle into ${city.name}`
          : city.highlights[highlightIndex],
        morning: isTransfer
          ? `High-speed train or flight to ${city.name}; hotel check-in`
          : city.highlights[highlightIndex],
        afternoon:
          pace === "relaxed"
            ? `Slow lunch and free time around a nearby neighborhood`
            : secondHighlight,
        evening:
          pace === "packed"
            ? `${city.evening[localDay % city.evening.length]}, followed by ${food}`
            : `Try ${food}, then visit ${city.evening[localDay % city.evening.length]}`,
        note: localDay === 0 ? city.tip : undefined,
      });
      dayNumber += 1;
    }
  });

  return result;
}

export default function SmartItineraryPlanner() {
  const [days, setDays] = useState(6);
  const [selectedCities, setSelectedCities] = useState(["Beijing", "Shanghai"]);
  const [selectedInterests, setSelectedInterests] = useState(["History", "Food"]);
  const [pace, setPace] = useState<Pace>("balanced");
  const [budget, setBudget] = useState<Budget>("comfort");
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);

  const estimatedBudget = useMemo(() => {
    const dailyRate = { smart: 90, comfort: 180, premium: 360 }[budget];
    return `$${(dailyRate * days).toLocaleString()}–$${Math.round(
      dailyRate * days * 1.35
    ).toLocaleString()}`;
  }, [budget, days]);

  function toggleCity(city: string) {
    setSelectedCities((current) => {
      if (current.includes(city)) {
        return current.length === 1 ? current : current.filter((item) => item !== city);
      }
      return current.length === 3 ? current : [...current, city];
    });
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  function generate() {
    setItinerary(buildItinerary(selectedCities, days, selectedInterests, pace));
  }

  function useInReadinessCheck() {
    const route = { cities: selectedCities };
    window.dispatchEvent(new CustomEvent("china-route-draft", { detail: route }));
    document.querySelector("#readiness")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="itinerary" className="bg-[#f7f7f7] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-[#FF385C]">SMART ITINERARY</p>
          <h2 className="text-3xl font-bold text-[#222] md:text-5xl">
            Turn a few choices into a China route.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#717171] md:text-lg">
            Build a practical first draft in seconds. You can send it to us for local
            advice, bookings, and guide availability.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#dddddd] bg-white shadow-[0_18px_60px_rgba(34,34,34,0.08)]">
          <div className="grid lg:grid-cols-[390px_1fr]">
            <div className="border-b border-[#ebebeb] p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div className="space-y-8">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-[#222]">
                    Trip length
                  </legend>
                  <div className="flex h-14 items-center justify-between rounded-lg border border-[#b0b0b0] px-2">
                    <button
                      type="button"
                      onClick={() => setDays((value) => Math.max(3, value - 1))}
                      className="h-10 w-10 text-2xl text-[#484848] hover:text-[#222]"
                      aria-label="Remove one day"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <span className="text-xl font-bold text-[#222]">{days}</span>
                      <span className="ml-1 text-sm text-[#717171]">days</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDays((value) => Math.min(14, value + 1))}
                      className="h-10 w-10 text-2xl text-[#484848] hover:text-[#222]"
                      aria-label="Add one day"
                    >
                      +
                    </button>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-1 text-sm font-semibold text-[#222]">
                    Cities
                  </legend>
                  <p className="mb-3 text-xs text-[#717171]">Choose up to 3</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.map((city) => {
                      const selected = selectedCities.includes(city.name);
                      return (
                        <button
                          key={city.name}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleCity(city.name)}
                          className={`flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                            selected
                              ? "border-[#222] bg-[#222] text-white"
                              : "border-[#dddddd] text-[#484848] hover:border-[#222]"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: city.color }}
                          />
                          {city.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-[#222]">
                    Interests
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => {
                      const selected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                            selected
                              ? "border-[#FF385C] bg-[#fff0f3] text-[#c72f4e]"
                              : "border-[#dddddd] text-[#484848] hover:border-[#222]"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-semibold text-[#222]">
                    Pace
                    <select
                      value={pace}
                      onChange={(event) => setPace(event.target.value as Pace)}
                      className="mt-2 h-11 w-full rounded-lg border border-[#b0b0b0] bg-white px-3 text-sm font-normal outline-none focus:border-[#222]"
                    >
                      <option value="relaxed">Relaxed</option>
                      <option value="balanced">Balanced</option>
                      <option value="packed">See more</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-[#222]">
                    Budget
                    <select
                      value={budget}
                      onChange={(event) => setBudget(event.target.value as Budget)}
                      className="mt-2 h-11 w-full rounded-lg border border-[#b0b0b0] bg-white px-3 text-sm font-normal outline-none focus:border-[#222]"
                    >
                      <option value="smart">Smart</option>
                      <option value="comfort">Comfort</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={generate}
                  className="h-13 w-full rounded-lg bg-[#FF385C] px-5 font-semibold text-white transition hover:bg-[#e31c5f]"
                >
                  Generate my itinerary
                </button>
              </div>
            </div>

            <div className="min-h-[620px] bg-[#fffdfd] p-6 md:p-10">
              {itinerary ? (
                <div className="animate-[itinerary-in_420ms_ease-out]">
                  <div className="mb-8 flex flex-col gap-5 border-b border-[#ebebeb] pb-7 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#717171]">
                        Your {days}-day draft
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-[#222] md:text-3xl">
                        {selectedCities.join(" → ")}
                      </h3>
                      <p className="mt-2 text-sm text-[#717171]">
                        Estimated on-trip budget per person:{" "}
                        <span className="font-semibold text-[#222]">{estimatedBudget}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={useInReadinessCheck}
                      className="h-11 shrink-0 rounded-lg border border-[#222] px-5 text-sm font-semibold text-[#222] transition hover:bg-[#222] hover:text-white"
                    >
                      Check this route
                    </button>
                  </div>

                  <div className="space-y-0">
                    {itinerary.map((item) => (
                      <article
                        key={item.day}
                        className="relative grid grid-cols-[42px_1fr] gap-4 pb-7 last:pb-0"
                      >
                        <div className="relative flex justify-center">
                          <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#222] text-xs font-bold text-white">
                            {item.day}
                          </div>
                          {item.day !== itinerary.length && (
                            <div className="absolute bottom-[-28px] top-9 w-px bg-[#dddddd]" />
                          )}
                        </div>
                        <div className="pb-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase text-[#FF385C]">
                              {item.city}
                            </span>
                            <span className="text-[#b0b0b0]">·</span>
                            <h4 className="font-semibold text-[#222]">{item.title}</h4>
                          </div>
                          <div className="grid gap-2 text-sm leading-6 text-[#717171] md:grid-cols-3 md:gap-5">
                            <p><span className="font-medium text-[#484848]">AM</span> {item.morning}</p>
                            <p><span className="font-medium text-[#484848]">PM</span> {item.afternoon}</p>
                            <p><span className="font-medium text-[#484848]">Night</span> {item.evening}</p>
                          </div>
                          {item.note && (
                            <p className="mt-3 border-l-2 border-[#FF385C] pl-3 text-xs leading-5 text-[#717171]">
                              Local note: {item.note}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <div className="relative mb-8 h-44 w-44">
                    <div className="absolute left-2 top-7 h-20 w-20 rounded-full border border-[#dddddd] bg-white" />
                    <div className="absolute right-1 top-14 h-24 w-24 rounded-full bg-[#fff0f3]" />
                    <div className="absolute left-1/2 top-1/2 h-28 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#b0b0b0]" />
                    {selectedCities.slice(0, 3).map((cityName, index) => {
                      const city = cities.find((item) => item.name === cityName) ?? cities[0];
                      const positions = ["left-5 top-7", "right-2 top-16", "left-16 bottom-0"];
                      return (
                        <div
                          key={city.name}
                          className={`absolute ${positions[index]} flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-[10px] font-bold text-white shadow-md`}
                          style={{ backgroundColor: city.color }}
                        >
                          {city.code}
                        </div>
                      );
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-[#222]">
                    Your route will appear here
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#717171]">
                    Choose what feels right, then generate a day-by-day starting point
                    with travel rhythm and local notes built in.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[#717171]">
          Budget is an estimate excluding international flights. Attraction availability
          and transport schedules should be confirmed before booking.
        </p>
      </div>
    </section>
  );
}
