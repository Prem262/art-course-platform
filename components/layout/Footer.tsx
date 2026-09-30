export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E7E2D8] bg-[#FAF8F5] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-sm font-medium text-[#141413]">
              The Art Studio
            </span>
            <span>·</span>
            <span>Online & Offline Botanical Studies</span>
          </div>

          <p className="tracking-wide">
            Mindful observation, natural pigment, and patient drawing.
          </p>
        </div>
      </div>
    </footer>
  );
}
