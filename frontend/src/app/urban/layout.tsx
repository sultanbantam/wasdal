"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Cable,
  Footprints,
  Flame,
  Store,
  Ban,
  Coins,
  ShieldAlert,
  LayoutDashboard,
} from "lucide-react";

const urbanNav = [
  { href: "/urban", label: "Overview", icon: LayoutDashboard },
  { href: "/urban/cables", label: "Kabel & Utilitas", icon: Cable },
  { href: "/urban/sidewalks", label: "Trotoar", icon: Footprints },
  { href: "/urban/obstructions", label: "Hambatan & Parkir", icon: Ban },
  { href: "/urban/vendors", label: "PKL & Zona", icon: Store },
  { href: "/urban/hotspots", label: "Hotspot", icon: Flame },
  { href: "/urban/walkpoints", label: "WalkPoints", icon: Coins },
  { href: "/urban/payments", label: "Kesiapan Pembayaran", icon: ShieldAlert },
];

export default function UrbanLayout({ children }: { children: React.ReactNode }) {
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
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base leading-tight">Ruang Kota Tangerang Selatan</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Wasdal V2
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pengawasan Kabel, Trotoar, PKL, Hotspot & WalkPoints
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/talent"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Ke Talenta ASN →
            </Link>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
          {urbanNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
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
