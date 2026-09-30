'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        throw new Error(signInError?.message || 'Invalid email or password');
      }

      // Check role to direct to /admin or /dashboard
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (nextPath) {
        router.push(nextPath);
      } else if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Artwork Column (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1C1917] overflow-hidden items-end p-12">
        <Image
          src="/images/hero-flower-1.jpg"
          alt="Botanical Art Studio"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-block px-3 py-1 bg-[#FAF8F5]/10 backdrop-blur-md rounded text-[11px] font-mono uppercase tracking-widest text-[#FAF8F5] border border-white/10">
            Private Learning Portal
          </div>
          <h1 className="font-serif text-4xl xl:text-5xl text-[#FAF8F5] font-normal leading-tight tracking-tight">
            Observation, patience, and deliberate mark-making.
          </h1>
          <p className="text-sm text-[#D9D4CA] leading-relaxed">
            Welcome to the digital studio. Access your assigned classes, follow guided instructional demonstrations, and track your ongoing artistic practice.
          </p>
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#FAF8F5]">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full border border-[#141413] flex items-center justify-center font-serif text-sm font-semibold text-[#141413] mb-4">
              A
            </div>
            <h2 className="font-serif text-3xl font-medium text-[#141413] tracking-tight">
              Sign In to Your Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6B65]">
              Please enter your studio email and password to access your courses.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-[#FAF0F0] border border-[#EAD0D0] text-[#8F2D2D] rounded text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider font-medium text-[#141413]"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] placeholder-[#A6A29A] focus:outline-none focus:border-[#141413] transition-colors"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs uppercase tracking-wider font-medium text-[#141413]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] placeholder-[#A6A29A] focus:outline-none focus:border-[#141413] transition-colors"
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-[#141413] hover:bg-black text-white text-xs uppercase tracking-wider font-medium rounded transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Information box */}
          <div className="p-4 bg-[#F3EFEA] border border-[#E7E2D8] rounded text-xs text-[#6E6B65] space-y-1.5">
            <p className="font-semibold text-[#141413]">Private Art Learning Business</p>
            <p className="text-[11px] leading-relaxed">
              Student accounts are issued directly by the studio administrator. If you do not have credentials yet, please reach out to your instructor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-xs text-[#78716C]">
          <div className="w-6 h-6 border-2 border-[#141413]/20 border-t-[#141413] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
