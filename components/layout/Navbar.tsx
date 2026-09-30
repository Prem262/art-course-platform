'use client';

import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, BookOpen, User, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import NextLink from 'next/link';

interface NavbarProps {
  user?: {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = pathname.startsWith('/admin');

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
      setLoggingOut(false);
    }
  }

  // Hide regular navbar on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Studio Brand */}
          <div className="flex items-center space-x-6">
            <NextLink href={isAdminRoute ? '/admin' : '/dashboard'} className="group flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full border border-[#141413] flex items-center justify-center font-serif text-sm font-semibold text-[#141413] group-hover:bg-[#141413] group-hover:text-white transition-colors">
                A
              </span>
              <div>
                <span className="font-serif text-lg sm:text-xl tracking-tight font-medium text-[#141413]">
                  The Art Studio
                </span>
                <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-[#78716C] ml-3 pl-3 border-l border-[#D9D4CA]">
                  {isAdminRoute ? 'Admin Portal' : 'Private Studio'}
                </span>
              </div>
            </NextLink>

            {/* Desktop Navigation Links */}
            {!isAdminRoute && user && (
              <nav className="hidden md:flex items-center space-x-1 pl-4">
                <NextLink
                  href="/dashboard"
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-[#141413] font-semibold bg-[#F3EFEA]'
                      : 'text-[#6E6B65] hover:text-[#141413] hover:bg-[#F3EFEA]/60'
                  }`}
                >
                  Dashboard
                </NextLink>
                <NextLink
                  href="/dashboard#my-classes"
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                    pathname.startsWith('/classes')
                      ? 'text-[#141413] font-semibold bg-[#F3EFEA]'
                      : 'text-[#6E6B65] hover:text-[#141413] hover:bg-[#F3EFEA]/60'
                  }`}
                >
                  My Classes
                </NextLink>
                <NextLink
                  href="/profile"
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                    pathname === '/profile'
                      ? 'text-[#141413] font-semibold bg-[#F3EFEA]'
                      : 'text-[#6E6B65] hover:text-[#141413] hover:bg-[#F3EFEA]/60'
                  }`}
                >
                  Profile
                </NextLink>
              </nav>
            )}
          </div>

          {/* Right Area: User details and actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && !isAdminRoute && (
              <NextLink
                href="/admin"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#2A4E39] bg-[#F1F6F3] border border-[#CEE0D4] rounded hover:bg-[#E3EEE6] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </NextLink>
            )}

            {isAdmin && isAdminRoute && (
              <NextLink
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#141413] bg-[#FAF8F5] border border-[#E7E2D8] rounded hover:bg-[#F3EFEA] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student View</span>
              </NextLink>
            )}

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-[#E7E2D8]">
                <div className="text-right">
                  <p className="text-xs font-medium text-[#141413]">
                    {user.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#78716C]">
                    {user.role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 text-[#78716C] hover:text-[#141413] hover:bg-[#F3EFEA] rounded transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NextLink
                href="/login"
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#141413] text-white rounded hover:bg-black transition-colors"
              >
                Sign In
              </NextLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#141413] rounded hover:bg-[#F3EFEA]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E2D8] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="pb-3 border-b border-[#E7E2D8]">
              <p className="text-xs font-semibold text-[#141413]">{user.full_name || user.email}</p>
              <p className="text-[11px] text-[#78716C] capitalize">{user.role}</p>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <NextLink
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-[#141413] rounded hover:bg-[#F3EFEA]"
            >
              Dashboard
            </NextLink>
            <NextLink
              href="/dashboard#my-classes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-[#141413] rounded hover:bg-[#F3EFEA]"
            >
              My Classes
            </NextLink>
            <NextLink
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-[#141413] rounded hover:bg-[#F3EFEA]"
            >
              Profile
            </NextLink>

            {isAdmin && (
              <NextLink
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#2A4E39] bg-[#F1F6F3] rounded border border-[#CEE0D4]"
              >
                Admin Dashboard
              </NextLink>
            )}
          </div>

          {user && (
            <div className="pt-3 border-t border-[#E7E2D8]">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-[#8F2D2D] bg-[#FAF0F0] rounded border border-[#EAD0D0]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
