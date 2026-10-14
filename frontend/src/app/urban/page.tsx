"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cable,
  Footprints,
  Flame,
  Store,
  Ban,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from "lucide-react";
import { getUrbanOverview } from "@/lib/api";
import type { UrbanOverview } from "@/types/wasdal";

export default function UrbanOverviewPage() {
  const [data, setData] = useState<UrbanOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getUrbanOverview()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat ringkasan Ruang Kota. Pastikan backend Wasdal berjalan.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <RefreshCw className="animate-spin text-emerald-600" size={28} />
        <p className="text-sm text-slate-500">Memuat metrik Ruang Kota...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Legal Guardrail */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-sm">Prinsip Wasdal: Prevent → Detect → Verify → Decide → Act → Verify Result</p>
          <p className="text-amber-800 dark:text-amber-300">
            AI hanya berfungsi sebagai asisten deteksi dan rekomendasi kandidat isu. Penetapan tindakan fisik utilitas, perizinan PKL, dan penegakan hukum wajib melalui verifikasi pejabat berwenang. Kanal denda/pembayaran bertanda <span className="font-bold underline">SIMULATION / NOT ENABLED FOR COLLECTION</span>.
          </p>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Index Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Space Health</span>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Footprints size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.health_index ?? 70.0}
            <span className="text-base font-normal text-slate-400">/100</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 size={13} /> Berdasarkan {data?.total_segments ?? 3} segmen koridor utama
          </p>
        </div>

        {/* Cables / Clutter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kabel & Utilitas</span>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Cable size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.cables.total ?? 0}
            <span className="text-xs font-normal text-slate-400 ml-1.5">terdaftar</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-red-600 dark:text-red-400 font-medium">
              {data?.cables.cluttered ?? 0} semrawut
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {data?.cables.suspected_inactive ?? 0} diduga mati
            </span>
          </div>
        </div>

        {/* Obstructions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hambatan Trotoar</span>
            <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600">
              <Ban size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.obstructions.total ?? 0}
            <span className="text-xs font-normal text-slate-400 ml-1.5">laporan</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {data?.obstructions.pending_verification ?? 0} perlu verifikasi
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {data?.obstructions.verified ?? 0} diverifikasi
            </span>
          </div>
        </div>

        {/* WalkPoints Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WalkPoints Pejalan</span>
            <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Coins size={18} />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.walkpoints.total_km ?? 0}
            <span className="text-base font-normal text-slate-400"> km</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {data?.walkpoints.participants ?? 0} peserta aktif • Voucher UMKM
          </p>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kabel.ID / Digital Utility Passport Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Cable size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Digital Utility Passport</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Kabel.ID
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Pencatatan koridor tiang & kabel optik, Utility Clutter Index transparan, inspeksi berkala, serta perapihan bersama operator utilitas dan APJATEL.
            </p>
          </div>
          <Link
            href="/urban/cables"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold text-blue-600 transition"
          >
            Buka Inventaris Kabel <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Trotoar & Aksesibilitas Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Footprints size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Trotoar & Pejalan Kaki</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Akses Ramah Difabel
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Inventaris kondisi fisik jalur pemandu (tactile paving), ramp kursi roda, lebar bersih minimum pedestrian, dan zona bebas halangan.
            </p>
          </div>
          <Link
            href="/urban/sidewalks"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-emerald-600 transition"
          >
            Lihat Segmen Trotoar <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Hotspot & PKL Tertata */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-orange-600">
                <Store size={20} />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">PKL & Zona Tertata</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                {data?.vendors.total_zones ?? 0} Zona Resmi
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Penataan terpadu zona pedagang berizin resmi (SK Walikota) dengan kepastian ruang minimum pejalan kaki tetap steril dan bersih.
            </p>
          </div>
          <Link
            href="/urban/vendors"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-semibold text-orange-600 transition"
          >
            Kelola Zona PKL <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pintasan Tindakan Ruang Kota</h4>
          <p className="text-xs text-slate-500">Kirim laporan hambatan baru, catat kabel, atau tinjau program WalkPoints</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/urban/obstructions"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow transition"
          >
            <Ban size={15} /> Lapor Hambatan / Parkir
          </Link>
          <Link
            href="/urban/cables"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition"
          >
            <PlusCircle size={15} /> Paspor Kabel Baru
          </Link>
          <Link
            href="/urban/walkpoints"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition"
          >
            <Coins size={15} /> Program WalkPoints
          </Link>
        </div>
      </div>
    </div>
  );
}
