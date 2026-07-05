export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-dark to-primary text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-semibold">Purple Fireflies</p>
          <p className="text-white/70 text-xs">Serving our community</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="mailto:info@purplefireflies.org" className="text-sm text-white/80 hover:text-white transition-colors">
            info@purplefireflies.org
          </a>
        </div>
        <p className="text-white/50 text-xs">© 2026 Purple Fireflies</p>
      </div>
    </footer>
  );
}
