export default function Hero() {
  return (
    <section className="relative pt-16 overflow-hidden">
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="text-red-200 font-medium mb-4 text-sm uppercase tracking-wider">
              Your Gateway to China
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Explore China
              <br />
              <span className="text-amber-300">Without the Hassle</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl leading-relaxed">
              Planning a trip to China? We help you navigate everything — from
              setting up local apps and internet access to finding the best
              guides and building your perfect itinerary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#plan"
                className="bg-white text-red-700 px-8 py-3.5 rounded-full font-semibold text-center hover:bg-amber-50 transition-colors"
              >
                Plan My Trip
              </a>
              <a
                href="#faq"
                className="border-2 border-white/40 text-white px-8 py-3.5 rounded-full font-semibold text-center hover:bg-white/10 transition-colors"
              >
                Travel Tips
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "🏯", title: "50+ Cities", desc: "Covered nationwide" },
              {
                icon: "🗣️",
                title: "Local Guides",
                desc: "English-speaking experts",
              },
              {
                icon: "📱",
                title: "Tech Support",
                desc: "Apps & internet help",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                desc: "WhatsApp & X available",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-red-200 text-xs mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
