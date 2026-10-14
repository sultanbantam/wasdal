"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getTalentCompetencies } from "@/lib/api";

export default function CompetenciesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentCompetencies()
      .then(setData)
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
            <Award className="text-indigo-600" size={26} /> Standar Kompetensi & Hasil Asesmen BKN
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kamus standar kompetensi manajerial, sosio-kultural, dan teknis ASN serta evaluasi kesenjangan (competency gap).
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

      {/* Competencies Standard Dictionary */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-blue-600" size={16} /> Kamus Standar Kompetensi Jabatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.competencies?.map((c: any) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600">{c.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {c.cluster}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Standar Level: <strong>Level {c.standard_level} / 5</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hasil Asesmen Kompetensi Terverifikasi</h4>
          <span className="text-xs text-slate-400">Pusat Asesmen Terakreditasi BKN</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Pegawai ASN</th>
                <th className="py-3 px-4">Kompetensi yang Diuji</th>
                <th className="py-3 px-4 text-center">Level Dicapai</th>
                <th className="py-3 px-4 text-center">Standar Butuh</th>
                <th className="py-3 px-4 text-center">Gap</th>
                <th className="py-3 px-4">Lembaga Penilai</th>
                <th className="py-3 px-4">Rekomendasi Pengembangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.assessments?.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{a.employee_name}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{a.competency_name}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">Level {a.current_level}</td>
                  <td className="py-3 px-4 text-center text-slate-600">Level {a.required_level}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.gap >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {a.gap >= 0 ? `+${a.gap}` : a.gap}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{a.assessment_body}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                    {a.development_recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
