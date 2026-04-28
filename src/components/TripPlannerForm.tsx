"use client";

import { useState } from "react";

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
      <section id="plan" className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Trip Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve received your travel plan. We&apos;ll get back to you
              within 24 hours with a personalized itinerary and recommendations.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-red-600 font-medium hover:underline"
            >
              Submit another request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plan" className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Plan Your China Trip
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Tell us about your travel plans and we&apos;ll help you prepare
            everything you need for an amazing trip to China.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-10 space-y-8"
        >
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              About You
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Travel Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Travel Dates
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Travelers
                </label>
                <select
                  name="travelers"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              Cities You Want to Visit
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {popularCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCities.includes(city)
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
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
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Add another city..."
              />
              <button
                type="button"
                onClick={addCustomCity}
                className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Add
              </button>
            </div>
            {selectedCities.length > 0 && (
              <p className="mt-3 text-sm text-gray-500">
                Selected: {selectedCities.join(", ")}
              </p>
            )}
          </div>

          {/* Guide & Interests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you need a local guide?
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "yes", label: "Yes, I need a guide" },
                    { value: "maybe", label: "Maybe, tell me more" },
                    { value: "no", label: "No, just tips" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="needGuide"
                        value={option.value}
                        defaultChecked={option.value === "maybe"}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What are you interested in?
                </label>
                <input
                  type="text"
                  name="interests"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., History, Food, Nature, Shopping, Nightlife, Photography..."
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                5
              </span>
              Your Questions
            </h3>
            <textarea
              name="questions"
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Any questions about traveling in China? e.g., How to access Google/WhatsApp? What apps do I need? How to pay without cash? How to get a SIM card?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            Submit My Trip Plan
          </button>
        </form>
      </div>
    </section>
  );
}
