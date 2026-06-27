export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-dark to-primary text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-semibold">Purple Fireflies</p>
          <p className="text-white/70 text-xs">Serving our community</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
          <a href="mailto:info@purplefireflies.org" className="text-sm text-white/80 hover:text-white transition-colors">
            info@purplefireflies.org
          </a>
        </div>
      </div>
    </footer>
  );
}
