"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Activity,
} from "lucide-react";
import { getUrbanHotspots } from "@/lib/api";
import type { UrbanHotspotItem } from "@/types/wasdal";

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<UrbanHotspotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = () => {
    setLoading(true);
    getUrbanHotspots()
      .then(setHotspots)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = hotspots.filter((h) => {
    return (
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location_name.toLowerCase().includes(search.toLowerCase()) ||
      h.district.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Flame className="text-rose-600" size={26} /> Hotspot Masalah Ruang Kota
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pemetaan titik-titik kejadian berulang (kabel semrawut, parkir liar di trotoar, hambatan difabel) untuk intervensi lintas OPD.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition w-fit"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Cari lokasi hotspot atau kecamatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs outline-none"
        />
      </div>

      {/* Hotspots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    h.severity === "Critical"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {h.severity} Priority
                </span>
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <Activity size={13} /> {h.incident_count_30d} Laporan / 30 Hari
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{h.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                {h.location_name} • Kec. {h.district}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tren Jam Paling Rawan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Clock size={12} /> {h.peak_hours}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lead OPD Penanggung Jawab</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{h.lead_agency}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Status: <strong className="text-slate-700 dark:text-slate-300">{h.status}</strong></span>
              <Link
                href="/executive/decision"
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Buat Decision Required <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
