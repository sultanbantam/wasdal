"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";
import { getTalentPools } from "@/lib/api";
import type { TalentPoolItem } from "@/types/wasdal";

export default function TalentPoolPage() {
  const [pools, setPools] = useState<TalentPoolItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentPools()
      .then(setPools)
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
            <Users className="text-indigo-600" size={26} /> Talent Pool Daerah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelompok kader talenta unggul yang telah diverifikasi komite untuk suksesi jabatan strategis dan percepatan pembangunan.
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

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {p.category}
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  {p.total_qualified_members} ASN Memenuhi Syarat
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{p.description}</p>

              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Kriteria Resmi Masuk Pool:</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">{p.criteria_rule}</p>
              </div>

              {p.sample_candidates && p.sample_candidates.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Kandidat Terdaftar Resmi:</span>
                  {p.sample_candidates.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded bg-slate-50/80 dark:bg-slate-800/40 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.position}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Kotak {c.box}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status: Terverifikasi Sistem Merit BKN</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
