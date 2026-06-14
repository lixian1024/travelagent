"use client";

import { useEffect, useState } from "react";

const popularCities = [
  "Beijing",
  "Shanghai",
  "Guangzhou",
  "Shenzhen",
  "Chengdu",
  "Xi'an",
  "Hangzhou",
  "Guilin",
  "Kunming",
  "Lijiang",
  "Zhangjiajie",
  "Harbin",
  "Suzhou",
  "Nanjing",
  "Chongqing",
  "Lhasa",
];

export default function TripPlannerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [customCity, setCustomCity] = useState("");
  const [draftInterests, setDraftInterests] = useState("");
  const [draftQuestions, setDraftQuestions] = useState("");

  useEffect(() => {
    function applyDraft(event?: Event) {
      const eventDraft =
        event instanceof CustomEvent
          ? (event.detail as {
              cities?: string[];
              interests?: string;
              questions?: string;
            })
          : null;
      const storedDraft = sessionStorage.getItem("china-trip-draft");
      const draft = eventDraft ?? (storedDraft ? JSON.parse(storedDraft) : null);

      if (!draft) return;
      if (Array.isArray(draft.cities)) setSelectedCities(draft.cities);
      if (typeof draft.interests === "string") setDraftInterests(draft.interests);
      if (typeof draft.questions === "string") setDraftQuestions(draft.questions);
    }

    applyDraft();
    window.addEventListener("china-trip-draft", applyDraft);
    return () => window.removeEventListener("china-trip-draft", applyDraft);
  }, []);

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  function addCustomCity() {
    const trimmed = customCity.trim();
    if (trimmed && !selectedCities.includes(trimmed)) {
      setSelectedCities((prev) => [...prev, trimmed]);
      setCustomCity("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      arrivalDate: formData.get("arrivalDate"),
      departureDate: formData.get("departureDate"),
      cities: selectedCities,
      travelers: formData.get("travelers"),
      needGuide: formData.get("needGuide"),
      interests: formData.get("interests"),
      questions: formData.get("questions"),
    };

    try {
      await fetch("/api/submit-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try contacting us directly.");
    }
  }

  if (submitted) {
    return (
      <section id="plan" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="border border-[#ebebeb] rounded-2xl p-12">
            <div className="w-16 h-16 bg-[#FFF0F3] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#FF385C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#222] mb-3">
              Request Submitted!
            </h2>
            <p className="text-[#717171] mb-6">
              We&apos;ve received your travel plan. We&apos;ll get back to you
              within 24 hours with a personalized itinerary.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#FF385C] font-semibold hover:underline"
            >
              Submit another request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plan" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#222] mb-4">
            Plan Your China Trip
          </h2>
          <p className="text-[#717171] max-w-xl mx-auto">
            Share your travel plans and we&apos;ll help you prepare everything
            for an amazing experience in China.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-[#ebebeb] rounded-2xl p-8 md:p-10 space-y-10"
        >
          {/* Personal Info */}
          <div>
            <h3 className="text-base font-semibold text-[#222] mb-5 pb-3 border-b border-[#ebebeb]">
              About You
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition placeholder:text-[#b0b0b0]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition placeholder:text-[#b0b0b0]"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Travel Dates */}
          <div>
            <h3 className="text-base font-semibold text-[#222] mb-5 pb-3 border-b border-[#ebebeb]">
              Travel Dates
            </h3>
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  Arrival Date
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  required
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  name="departureDate"
                  required
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  Travelers
                </label>
                <select
                  name="travelers"
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition bg-white"
                >
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3-5">3-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="10+">10+ people</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-base font-semibold text-[#222] mb-5 pb-3 border-b border-[#ebebeb]">
              Destinations
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {popularCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    selectedCities.includes(city)
                      ? "bg-[#222] text-white border-[#222]"
                      : "bg-white text-[#484848] border-[#dddddd] hover:border-[#222]"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCity();
                  }
                }}
                className="flex-1 border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition placeholder:text-[#b0b0b0]"
                placeholder="Add another city..."
              />
              <button
                type="button"
                onClick={addCustomCity}
                className="border border-[#222] text-[#222] px-5 py-3 rounded-lg hover:bg-[#f7f7f7] transition font-medium text-sm"
              >
                Add
              </button>
            </div>
            {selectedCities.length > 0 && (
              <p className="mt-3 text-sm text-[#717171]">
                Selected: {selectedCities.join(", ")}
              </p>
            )}
          </div>

          {/* Guide & Interests */}
          <div>
            <h3 className="text-base font-semibold text-[#222] mb-5 pb-3 border-b border-[#ebebeb]">
              Preferences
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-3">
                  Do you need a local guide?
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "yes", label: "Yes, I need a guide" },
                    { value: "maybe", label: "Maybe, tell me more" },
                    { value: "no", label: "No, just tips" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2.5 cursor-pointer border border-[#dddddd] rounded-lg px-4 py-3 hover:border-[#222] transition has-[:checked]:border-[#222] has-[:checked]:bg-[#f7f7f7]"
                    >
                      <input
                        type="radio"
                        name="needGuide"
                        value={option.value}
                        defaultChecked={option.value === "maybe"}
                        className="w-4 h-4 accent-[#222]"
                      />
                      <span className="text-sm text-[#484848]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">
                  What are you interested in?
                </label>
                <input
                  type="text"
                  name="interests"
                  value={draftInterests}
                  onChange={(event) => setDraftInterests(event.target.value)}
                  className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition placeholder:text-[#b0b0b0]"
                  placeholder="History, Food, Nature, Shopping, Nightlife, Photography..."
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-base font-semibold text-[#222] mb-5 pb-3 border-b border-[#ebebeb]">
              Questions
            </h3>
            <textarea
              name="questions"
              rows={4}
              value={draftQuestions}
              onChange={(event) => setDraftQuestions(event.target.value)}
              className="w-full border border-[#b0b0b0] rounded-lg px-4 py-3 text-[#222] focus:border-[#222] focus:ring-1 focus:ring-[#222] outline-none transition resize-none placeholder:text-[#b0b0b0]"
              placeholder="Any questions about China? e.g., How to access Google? What apps do I need? How do I pay without cash?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF385C] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#E31C5F] transition-colors"
          >
            Submit My Trip Plan
          </button>
        </form>
      </div>
    </section>
  );
}
