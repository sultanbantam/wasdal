"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getUrbanVendors } from "@/lib/api";
import type { StreetVendorZoneItem } from "@/types/wasdal";

export default function VendorsPage() {
  const [zones, setZones] = useState<StreetVendorZoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = () => {
    setLoading(true);
    getUrbanVendors()
      .then(setZones)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = zones.filter((z) => {
    return (
      z.zone_name.toLowerCase().includes(search.toLowerCase()) ||
      z.district.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Store className="text-orange-600" size={26} /> Penataan PKL & Zona Aktivitas Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan zona pedagang kaki lima resmi (SK Walikota), kepastian jam operasional, dan perlindungan jalur pejalan kaki.
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

      {/* Policy Guardrail */}
      <div className="rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/70 dark:bg-orange-950/30 p-4 text-xs flex items-start gap-3 text-orange-900 dark:text-orange-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-orange-600 shrink-0" />
        <div>
          <span className="font-bold">Prinsip Penataan PKL Berkeadilan:</span> Tujuan modul ini adalah menata secara tertib, bukan sekadar menggusur dan bukan pula melegalkan penggunaan trotoar secara sepihak. Seluruh zona resmi wajib mengacu pada SK penetapan kepala daerah dengan ketentuan lebar bebas pedestrian minimum tetap steril.
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Cari zona PKL atau kecamatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs outline-none"
        />
      </div>

      {/* Vendor Zones List */}
      <div className="space-y-6">
        {filtered.map((z) => (
          <div
            key={z.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{z.zone_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Zona Sah Terdaftar
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {z.location_description} • Kec. {z.district}
                </p>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Kapasitas: {z.current_registered_stalls} / {z.max_capacity_stalls} Lapak
                </span>
                <span className="text-[11px] text-slate-400">Jalur Bebas Pejalan: &ge; {z.mandatory_free_pedestrian_width_meters} m</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[10px]">Dasar Hukum Penetapan</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{z.legal_basis}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Instansi Pengesah</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{z.authorized_by}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Jam Operasional Sah</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock size={12} /> {z.active_hours}
                </span>
              </div>
            </div>

            {/* Registered Vendors Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pedagang Terdaftar di Zona Ini:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Kode Lapak</th>
                      <th className="py-2 px-3">No. Lapak</th>
                      <th className="py-2 px-3">Jenis Usaha</th>
                      <th className="py-2 px-3">Status Verifikasi</th>
                      <th className="py-2 px-3 text-center">Skor Kebersihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {z.vendors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 text-xs">
                          Belum ada pedagang terdaftar dalam zona ini.
                        </td>
                      </tr>
                    ) : (
                      z.vendors.map((v) => (
                        <tr key={v.vendor_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono text-blue-600">{v.vendor_code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{v.stall_number || "-"}</td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{v.business_type}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium">
                              {v.verification_status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-600">
                            {v.cleanliness_score}/100
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
