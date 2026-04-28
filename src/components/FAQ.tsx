"use client";

import { useState } from "react";

const faqs = [
  {
    category: "Internet & VPN",
    icon: "🌐",
    items: [
      {
        q: "Can I use Google, WhatsApp, Instagram, and YouTube in China?",
        a: "These services are blocked in mainland China. You'll need a VPN to access them. We recommend setting up a reliable VPN before you arrive. Alternatively, Chinese apps like WeChat (messaging), Baidu Maps (navigation), and Bilibili (videos) work great.",
      },
      {
        q: "How do I get internet access in China?",
        a: "You have several options: (1) Buy a local SIM card at the airport — China Mobile and China Unicom have tourist-friendly plans. (2) Get an eSIM before you travel. (3) Rent a portable WiFi device. We recommend option 1 or 2 for the best experience.",
      },
      {
        q: "Do I need a Chinese phone number?",
        a: "A Chinese phone number is very helpful for registering on local apps like WeChat, Alipay, and Didi (ride-hailing). Most airport SIM cards will give you a local number.",
      },
    ],
  },
  {
    category: "Apps & Payment",
    icon: "📱",
    items: [
      {
        q: "What apps should I download before visiting China?",
        a: "Essential apps: WeChat (messaging & payments), Alipay (payments), Didi (ride-hailing, like Uber), Baidu Maps or Amap (navigation), Trip.com (booking), and a translation app like Google Translate (download offline Chinese pack beforehand).",
      },
      {
        q: "How do I pay for things in China?",
        a: "China is largely cashless. Most places accept WeChat Pay and Alipay. Good news: both apps now allow international credit cards! Set up Alipay or WeChat Pay and link your Visa/Mastercard before you arrive. Keep some cash (RMB) for small vendors and rural areas.",
      },
      {
        q: "Can I use Uber or Google Maps in China?",
        a: "Uber doesn't operate in China — use Didi instead (available in English). Google Maps doesn't work well — use Baidu Maps or Amap (Gaode Maps). Both have English interfaces and are much more accurate for China.",
      },
    ],
  },
  {
    category: "Transportation",
    icon: "🚄",
    items: [
      {
        q: "How do I get around between cities?",
        a: "China's high-speed rail network is world-class and the best way to travel between cities. You can book tickets on Trip.com or 12306 (official app). For longer distances, domestic flights are affordable. Within cities, use the metro (excellent in major cities) and Didi.",
      },
      {
        q: "Do I need an international driving license?",
        a: "China does not recognize international driving licenses. Foreigners cannot drive in China unless they obtain a temporary Chinese driving license. We recommend using public transport, Didi, or hiring a driver instead.",
      },
    ],
  },
  {
    category: "Visa & Entry",
    icon: "🛂",
    items: [
      {
        q: "Do I need a visa to visit China?",
        a: "It depends on your nationality. China has expanded its visa-free transit policy (144-hour) for many countries and offers visa-free entry for several nationalities. Check the latest policy for your country. We can help you figure out your visa requirements.",
      },
      {
        q: "What about the 144-hour visa-free transit?",
        a: "Citizens from 54+ countries can enjoy 144-hour (6-day) visa-free transit in major cities including Beijing, Shanghai, Guangzhou, Chengdu, and more. You need a confirmed onward ticket to a third country. This is a great option for short trips!",
      },
    ],
  },
  {
    category: "Language & Culture",
    icon: "🗣️",
    items: [
      {
        q: "Do people speak English in China?",
        a: "English is limited outside major tourist areas and international hotels. In big cities like Beijing and Shanghai, you'll find more English speakers. We recommend downloading an offline translation app and learning a few basic Chinese phrases. Having a guide makes a huge difference!",
      },
      {
        q: "Is China safe for foreign travelers?",
        a: "China is one of the safest countries for tourists. Violent crime is very rare, and petty theft is uncommon compared to many other travel destinations. Use common sense as you would anywhere. People are generally very friendly and curious about foreign visitors.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full text-left py-4 flex items-start justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-gray-900 text-sm md:text-base">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-gray-600 text-sm leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Essential Travel Tips
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Everything you need to know before visiting China. From internet
            access to payments, we&apos;ve got you covered.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div
              key={section.category}
              className="bg-gray-50 rounded-2xl p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.category}
              </h3>
              <div>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
