import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#FAF0F0] border border-[#EAD0D0] flex items-center justify-center text-[#8F2D2D] mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          403 · Access Forbidden
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413]">
          Administrative Privileges Required
        </h1>
        <p className="text-sm text-[#6E6B65] max-w-md mx-auto leading-relaxed">
          You are attempting to access an area reserved strictly for studio administrators. Your account does not have sufficient role privileges.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Student Workspace</span>
        </Link>
      </div>
    </div>
  );
}
