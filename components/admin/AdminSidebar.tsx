'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Video,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { label: 'Lessons', href: '/admin/lessons', icon: Video },
  { label: 'Student Progress', href: '/admin/progress', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-[#FFFFFF] border-r border-[#E7E2D8] flex flex-col justify-between shrink-0">
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#78716C] block">
            Studio Management
          </span>
          <h2 className="font-serif text-lg font-medium text-[#141413] mt-0.5">
            Admin Console
          </h2>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#141413] text-white'
                    : 'text-[#6E6B65] hover:text-[#141413] hover:bg-[#F3EFEA]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher */}
      <div className="p-4 sm:p-6 border-t border-[#E7E2D8] bg-[#FAF8F5]">
        <Link
          href="/dashboard"
          className="flex items-center justify-between text-xs text-[#78716C] hover:text-[#141413] font-medium"
        >
          <span>View Student Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
