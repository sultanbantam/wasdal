"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  UsersRound,
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Database,
  Award,
  Grid3X3,
  Users,
  Target,
  Sparkles,
  Milestone,
} from "lucide-react";

const talentNav = [
  { href: "/talent", label: "Overview", icon: LayoutDashboard },
  { href: "/talent/socialization", label: "Sosialisasi & FAQ", icon: GraduationCap },
  { href: "/talent/me", label: "Profil Saya", icon: UserCheck },
  { href: "/talent/data-quality", label: "Kualitas Data", icon: Database },
  { href: "/talent/competency", label: "Kompetensi", icon: Award },
  { href: "/talent/9box", label: "Talent Map (9 Box)", icon: Grid3X3 },
  { href: "/talent/pool", label: "Talent Pool", icon: Users },
  { href: "/talent/idp", label: "Pengembangan (IDP)", icon: Target },
  { href: "/talent/succession", label: "Succession Planning", icon: UserCheck },
  { href: "/talent/mobility", label: "Mobilitas ASN", icon: Sparkles },
  { href: "/talent/implementation", label: "Monitoring Implementasi", icon: Milestone },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Kembali ke Wasdal Command Center"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <UsersRound size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base leading-tight">Manajemen Talenta ASN Tangerang Selatan</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                    Sistem Merit
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  BKPSDM Tangsel • Penyelarasan, 9-Box, Suksesi, Kualitas Data & IDP
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/urban"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Ke Ruang Kota →
            </Link>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
          {talentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
