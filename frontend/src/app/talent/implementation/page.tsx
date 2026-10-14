"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Milestone,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { getTalentImplementation } from "@/lib/api";
import type { TalentMilestoneItem } from "@/types/wasdal";

export default function ImplementationPage() {
  const [milestones, setMilestones] = useState<TalentMilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentImplementation()
      .then(setMilestones)
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
            <Milestone className="text-indigo-600" size={26} /> Monitoring Implementasi Manajemen Talenta
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan roadmap tahapan Sistem Merit ASN Kota Tangerang Selatan menuju predikat Sangat Baik.
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

      {/* Milestones Timeline List */}
      <div className="space-y-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  m.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : m.status === "In Progress"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {m.status === "Completed" ? <CheckCircle2 size={18} /> : m.phase_order}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.phase_name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : m.status === "In Progress"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{m.target_description}</p>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                  <span>PIC: <strong>{m.lead_pic}</strong></span>
                  {m.deadline && (
                    <span>Tenggat: {new Date(m.deadline).toLocaleDateString("id-ID")}</span>
                  )}
                  {m.evidence_notes && (
                    <span className="text-emerald-600 font-medium">Bukti: {m.evidence_notes}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:self-center">
              {m.status === "Pending Decision" && (
                <Link
                  href="/executive/decision"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition"
                >
                  Decision Required <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
