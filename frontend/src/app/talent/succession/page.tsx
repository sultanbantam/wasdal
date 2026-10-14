"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Award,
} from "lucide-react";
import { getTalentSuccession } from "@/lib/api";
import type { TalentSuccessionItem } from "@/types/wasdal";

export default function SuccessionPage() {
  const [items, setItems] = useState<TalentSuccessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentSuccession()
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
            <UserCheck className="text-indigo-600" size={26} /> Rencana Suksesi Jabatan Kritis (Succession Planning)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen risiko kekosongan jabatan pimpinan strategis dan pemetaan talenta berstatus &apos;Ready Now&apos;.
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

      {/* Critical Positions List */}
      <div className="space-y-6">
        {items.map((pos) => (
          <div
            key={pos.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pos.position_title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      pos.urgency_level === "Critical"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {pos.urgency_level} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{pos.agency_opd}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Pejabat Definitif Saat Ini</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  {pos.current_incumbent}
                </span>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 sm:justify-end mt-0.5">
                  <Clock size={12} /> Proyeksi Pensiun: {pos.retirement_date ? new Date(pos.retirement_date).toLocaleDateString("id-ID") : "Segera"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
              <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                Kualifikasi & Kompetensi Utama yang Dibutuhkan:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{pos.required_competencies}</p>
            </div>

            {/* Successor Pipeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pipeline Kader Penerus yang Terverifikasi Komite:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pos.successors.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{s.candidate_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.readiness_status === "Ready Now"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {s.readiness_status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Skor Kesiapan: <strong className="text-indigo-600">{s.readiness_score}/100</strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      <strong>Gap Analisis:</strong> {s.gap_summary}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                      Rencana Aksi: {s.development_plan}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Status: Disahkan Komite Talenta Daerah</span>
              <Link
                href="/executive/decision"
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-xs"
              >
                Eskalasi ke Decision Required <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
