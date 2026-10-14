"use client";

import { useEffect, useState } from "react";
import {
  Footprints,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { getUrbanSidewalks } from "@/lib/api";
import type { SidewalkItem } from "@/types/wasdal";

export default function SidewalksPage() {
  const [sidewalks, setSidewalks] = useState<SidewalkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  const loadData = () => {
    setLoading(true);
    getUrbanSidewalks()
      .then(setSidewalks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = sidewalks.filter((s) => {
    const matchSearch =
      s.street_name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase());
    const matchZone = zoneFilter ? s.zone_category === zoneFilter : true;
    return matchSearch && matchZone;
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Footprints className="text-emerald-600" size={26} /> Trotoar & Akses Pejalan Kaki
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Inventaris digital fasilitas pedestrian, tactile paving (jalur pemandu), dan ruang bebas halangan.
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

      {/* Critical Accessibility Guardrail */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-xs flex items-start gap-3 text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Pedestrian Accessibility Policy:</span> Dilarang merekomendasikan penempatan lapak PKL, tiang utilitas, atau kantong parkir pada tactile paving (jalur pemandu difabel), akses kursi roda (ramp), halte angkutan umum, atau penyeberangan pejalan kaki (zebra cross).
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari koridor jalan atau kecamatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
        <div>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="">Semua Zona Pedestrian</option>
            <option value="Protected Pedestrian Zone">Protected Pedestrian Zone</option>
            <option value="Managed Public-Space Zone">Managed Public-Space Zone</option>
            <option value="Needs Field Verification">Needs Field Verification</option>
          </select>
        </div>
      </div>

      {/* Sidewalk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.street_name}</h3>
                  <span className="text-[11px] text-slate-400">{s.district}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.zone_category === "Protected Pedestrian Zone"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : s.zone_category === "Managed Public-Space Zone"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {s.zone_category}
                </span>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Lebar Fisik</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.width_meters} m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lebar Bebas Pejalan</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {s.clear_pedestrian_width_meters} m
                  </span>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Jalur Pemandu (Tactile Paving):</span>
                  {s.has_tactile_paving ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={13} /> Tersedia
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-500 font-medium">
                      <XCircle size={13} /> Belum Ada
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Ramp Kursi Roda:</span>
                  {s.has_wheelchair_ramp ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={13} /> Tersedia
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-500 font-medium">
                      <XCircle size={13} /> Belum Ada
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Kondisi Fisik:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.surface_condition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Penerangan:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.lighting_condition}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Status: <strong className="text-slate-800 dark:text-slate-300">{s.repair_status}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
