"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UsersRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Target,
  Grid3X3,
  UserCheck,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Database,
  Building,
} from "lucide-react";
import { getTalentOverview } from "@/lib/api";
import type { TalentOverview } from "@/types/wasdal";

export default function TalentOverviewPage() {
  const [data, setData] = useState<TalentOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getTalentOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <RefreshCw className="animate-spin text-indigo-600" size={28} />
        <p className="text-sm text-slate-500">Memuat metrik Talenta ASN...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Legal Guardrail */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/30 p-4 flex items-start gap-3 text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-sm">Prinsip Sistem Merit & Batasan Kewenangan AI:</p>
          <p className="text-indigo-800 dark:text-indigo-300">
            Wasdal Talenta ASN adalah instrumen pengawasan akselerasi sistem merit Pemkot Tangsel. Modul ini <strong>bukan pengganti SIASN BKN</strong>. AI dilarang menetapkan mutasi, promosi, demosi, ataupun mengubah nilai asesmen dan 9-Box resmi. Seluruh keputusan pengangkatan jabatan sepenuhnya kewenangan Pejabat Pembina Kepegawaian (PPK).
          </p>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Index */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kesiapan Sistem Merit</span>
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.readiness_index_pct ?? 86.4}%
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
            Kategori Sangat Baik (KASN / BKN)
          </p>
        </div>

        {/* Data Completeness */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelengkapan Data ASN</span>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Database size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.average_data_completeness ?? 90}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {data?.data_quality_issues_pending ?? 0} isu data dalam koreksi
          </p>
        </div>

        {/* IDP Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IDP Terlaksana</span>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Target size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.idp_summary.average_progress_pct ?? 0}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {data?.idp_summary.total_active ?? 0} dokumen IDP aktif disetujui atasan
          </p>
        </div>

        {/* Succession Readiness */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jabatan Kritis & Suksesi</span>
            <span className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
              <UserCheck size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.succession_summary.critical_positions ?? 0}
            <span className="text-xs font-normal text-slate-400 ml-1.5">posisi kritis</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            {data?.succession_summary.ready_now_successors ?? 0} calon &apos;Ready Now&apos; terverifikasi
          </p>
        </div>
      </div>

      {/* 9-Box Mini Preview & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 9 Box Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Grid3X3 size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Talent Map (9-Box Grid)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Resmi BKN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Pemetaan kinerja (SKP) vs potensi (Asesmen BKN). Top Talent di Box 8 & 9 diproyeksikan masuk rencana suksesi prioritas pimpinan daerah.
            </p>
          </div>
          <Link
            href="/talent/9box"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-indigo-600 transition"
          >
            Buka Matriks 9-Box <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Sosialisasi & Edukasi */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <GraduationCap size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Sosialisasi & Regulasi</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                AI FAQ Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Akses materi PermenPAN-RB No. 3/2020, pedoman teknis perwal, webinar berkala, serta asisten AI tanya-jawab regulasi meritokrasi.
            </p>
          </div>
          <Link
            href="/talent/socialization"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold text-blue-600 transition"
          >
            Materi & AI FAQ <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Profil ASN & Koreksi Data */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-purple-600">
                <UserCheck size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Profil ASN Saya</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Akses Mandiri
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Lihat riwayat jabatan, sertifikasi, nilai kinerja, dan kuadran 9-box Anda. ASN dapat mengajukan perbaikan data yang diverifikasi BKPSDM.
            </p>
          </div>
          <Link
            href="/talent/me"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold text-purple-600 transition"
          >
            Lihat Profil Saya <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Implementation Roadmap Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Monitoring Roadmap Sistem Merit</h4>
          <p className="text-xs text-slate-500">Pantau tahapan regulasi, asesmen massal, hingga sidang komite suksesi</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/talent/implementation"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow transition"
          >
            Monitoring Roadmap <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/executive/decision"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Decision Required Pimpinan
          </Link>
        </div>
      </div>
    </div>
  );
}
