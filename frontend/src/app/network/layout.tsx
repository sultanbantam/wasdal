"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Network,
  LayoutDashboard,
  Building,
  BarChart3,
  Stethoscope,
  Coins,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Landmark,
  Users2,
  CheckSquare,
  FileDown,
  ShieldCheck,
  UserCog,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const navSections = [
  {
    title: "Data Daerah",
    items: [
      { href: "/network", label: "Beranda Jejaring", icon: LayoutDashboard },
      { href: "/network/profile", label: "Profil Daerah Saya", icon: Building },
      { href: "/network/indicators", label: "Data Wilayah & Indikator", icon: BarChart3 },
      { href: "/network/fiscal", label: "Fiskal & APBD", icon: Coins },
    ],
  },
  {
    title: "Analisis & Diagnosis",
    items: [
      { href: "/network/diagnoses", label: "Diagnosis Daerah", icon: Stethoscope },
      { href: "/network/issues", label: "Isu Strategis (5W1H)", icon: AlertTriangle },
      { href: "/network/assets", label: "Aset & Potensi Daerah", icon: Landmark },
    ],
  },
  {
    title: "Gagasan & Aksi",
    items: [
      { href: "/network/ideas", label: "Bank Gagasan Inovasi", icon: Lightbulb },
      { href: "/network/pilots", label: "Proyek Percontohan", icon: Rocket },
      { href: "/network/decisions", label: "Decision Required", icon: CheckSquare },
    ],
  },
  {
    title: "Kolaborasi & Tata Kelola",
    items: [
      { href: "/network/fgd", label: "FGD Nasional", icon: Users2 },
      { href: "/network/validation", label: "Validasi & Audit", icon: ShieldCheck },
      { href: "/network/export", label: "Laporan & Ekspor", icon: FileDown },
      { href: "/network/team", label: "Pengaturan Tim", icon: UserCog },
    ],
  },
];

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 lg:px-6 py-3">
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
                <Network size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base leading-tight">Jejaring Staf Ahli Daerah</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                    Nasional
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Satu Data, Banyak Gagasan, Solusi Bersama untuk Daerah
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
              <Sparkles size={14} className="text-indigo-500 animate-pulse" />
              <span>Pilot: Transformasi Fiskal & Kemandirian Daerah</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1 max-w-7xl mx-auto mt-3 overflow-x-auto no-scrollbar pb-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          {navSections.flatMap((s) => s.items).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Menu Jejaring</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}
