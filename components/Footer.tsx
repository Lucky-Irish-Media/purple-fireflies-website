export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#6800AB] text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-sm">
        <div className="text-center sm:text-left">
          <p className="font-semibold">Purple Fireflies</p>
          <p className="text-white/80 text-xs">Serving our community</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
          <span className="font-bold text-lg">740-856-6176</span>
          <span className="text-white/90">|</span>
          <span className="text-sm">call to report</span>
        </div>
      </div>
    </footer>
  );
}
