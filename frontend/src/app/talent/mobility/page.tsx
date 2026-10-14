"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Building,
  User,
} from "lucide-react";
import { getTalentMobility } from "@/lib/api";
import type { TalentMobilityItem } from "@/types/wasdal";

export default function MobilityPage() {
  const [items, setItems] = useState<TalentMobilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentMobility()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Sparkles className="text-indigo-600" size={26} /> Rekomendasi Mobilitas & Rotasi Terarah ASN
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penjodohan berbasis kualifikasi kompetensi, rekam jejak, dan kebutuhan prioritas organisasi pembangunan daerah.
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

      {/* AI Guardrail Info Banner */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-4 text-xs flex items-start gap-3 text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-indigo-600 shrink-0" />
        <div>
          <span className="font-bold">Transparansi Algoritma & Netralitas ASN:</span> Rekomendasi mutasi/rotasi disusun berdasarkan data riil capaian kinerja dan uji kompetensi terakreditasi BKN. AI dilarang menggunakan agama, ras, suku, jenis kelamin, preferensi politik, atau hubungan kekerabatan sebagai faktor pertimbangan. Keputusan final mutasi tetap hak prerogatif PPK.
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {m.review_status}
                </span>
                <span className="text-sm font-black text-indigo-600">
                  {m.match_score_pct}% Match
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{m.candidate_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Jabatan Saat Ini: {m.current_position}</p>

              <div className="mt-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-800 dark:text-indigo-300 block">
                  Rekomendasi Posisi Sasaran
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-xs">{m.recommended_target_position}</div>
                <div className="text-[11px] text-slate-500">{m.target_agency_opd}</div>
              </div>

              {/* "Why this recommendation appears" panel */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <HelpCircle size={13} className="text-indigo-600" /> Mengapa rekomendasi ini muncul?
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                  {m.rationale_why}
                </p>
                <div className="space-y-1 pt-1">
                  {m.factors_considered?.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 italic">
              {m.ai_disclaimer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
