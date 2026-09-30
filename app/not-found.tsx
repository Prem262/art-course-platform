import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#F3EFEA] border border-[#E7E2D8] flex items-center justify-center text-[#78716C] mx-auto">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          404 · Page Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413]">
          This Studio Page Does Not Exist
        </h1>
        <p className="text-sm text-[#6E6B65] max-w-md mx-auto leading-relaxed">
          The requested lesson, class, or studio document could not be found. It may have been moved or unpublished.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
