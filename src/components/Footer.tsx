export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇨🇳</span>
            <span className="text-lg font-bold text-white">
              China<span className="text-red-500">Travel</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#plan" className="hover:text-white transition-colors">
              Plan Your Trip
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Travel Tips
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} ChinaTravel. Helping you explore
            China with confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}
