'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled platform error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#FAF0F0] border border-[#EAD0D0] flex items-center justify-center text-[#8F2D2D] mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          Studio System Notice
        </span>
        <h1 className="font-serif text-3xl font-medium text-[#141413]">
          Something Interrupted Your Session
        </h1>
        <p className="text-sm text-[#6E6B65] max-w-md mx-auto leading-relaxed">
          An unexpected error occurred while loading this page. Your progress remains securely saved.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center space-x-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] border border-[#E7E2D8] text-xs uppercase tracking-wider font-medium text-[#141413] rounded hover:bg-[#F3EFEA] transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
