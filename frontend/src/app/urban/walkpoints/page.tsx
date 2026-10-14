"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  Footprints,
  Gift,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Award,
} from "lucide-react";
import { getWalkpointsOverview, walkpointCheckin, walkpointRedeem } from "@/lib/api";
import type { WalkpointsData } from "@/types/wasdal";

export default function WalkpointsPage() {
  const [data, setData] = useState<WalkpointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getWalkpointsOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckin = async () => {
    if (!data?.account_demo.id) return;
    setCheckingIn(true);
    setMessage(null);
    try {
      const res = await walkpointCheckin(data.account_demo.id, "Koridor Pedestrian BSD - Serpong");
      setMessage({ text: res.message, type: "success" });
      loadData();
    } catch (err: any) {
      setMessage({ text: "Gagal melakukan check-in.", type: "error" });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!data?.account_demo.id) return;
    setRedeemingId(rewardId);
    setMessage(null);
    try {
      const res = await walkpointRedeem(data.account_demo.id, rewardId);
      setMessage({ text: res.message, type: "success" });
      setRedeemedCode(res.redemption_code);
      loadData();
    } catch (err: any) {
      setMessage({ text: "Gagal menukarkan reward atau poin tidak mencukupi.", type: "error" });
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Coins className="text-amber-500" size={26} /> WalkPoints: Insentif Pejalan Kaki
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Program apresiasi non-tunai mobilitas sehat pejalan kaki pada koridor publik Kota Tangerang Selatan.
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

      {/* Program Legal Disclaimer Banner */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs flex items-start gap-3 text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Ketentuan Tata Kelola WalkPoints:</span> WalkPoints adalah poin loyalitas non-tunai dan bukan uang elektronik, mata uang digital, ataupun aset kripto. Sumber pendanaan berasal dari program APBD kemitraan lingkungan dan CSR merchant yang sah. Denda pelanggaran tidak dialihkan ke WalkPoints.
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <CheckCircle2 size={16} />
          {message.text}
          {redeemedCode && (
            <span className="ml-2 font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
              Kode Voucher: {redeemedCode}
            </span>
          )}
        </div>
      )}

      {/* Account Balance & Check-in Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-100 text-xs mb-3">
              <span className="font-semibold uppercase tracking-wider">Kartu Pejalan Kaki</span>
              <Award size={18} />
            </div>
            <div className="text-3xl font-black mb-1">{data?.account_demo.balance_points ?? 0} <span className="text-base font-normal">Poin</span></div>
            <p className="text-xs text-amber-100">{data?.account_demo.participant_name ?? "Peserta Terdaftar"}</p>
          </div>
          <div className="pt-4 border-t border-amber-400/40 text-xs flex items-center justify-between text-amber-100">
            <span>Tier: <strong>{data?.account_demo.tier}</strong></span>
            <span>Jarak: <strong>{data?.account_demo.total_km} km</strong></span>
          </div>
        </div>

        {/* QR Check-in Simulator */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
              <QrCode className="text-emerald-600" size={18} /> Check-In Koridor Pejalan Kaki
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Pindai QR fisik di tiang tanda pejalan kaki atau lakukan simulasi check-in koridor ramah pejalan. Dapatkan +50 WalkPoints per check-in (Batas harian: 250 poin).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckin}
              disabled={checkingIn}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-2 transition"
            >
              <Footprints size={15} />
              {checkingIn ? "Memverifikasi Check-in..." : "Simulasi Check-in Koridor BSD (+50 Poin)"}
            </button>
            <span className="text-[11px] text-slate-400">Verifikasi geolokasi & anti-fraud aktif</span>
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="text-rose-500" size={18} /> Katalog Reward Mitra UMKM & Fasilitas Publik
          </h3>
          <span className="text-xs text-slate-400">Poin dapat ditukarkan voucher mitra lokal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {r.category}
                  </span>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Coins size={13} /> {r.points_required} Poin
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{r.reward_title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{r.partner_merchant_name}</p>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{r.terms}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Tersedia: {r.stock_available} voucher</span>
                <button
                  onClick={() => handleRedeem(r.id)}
                  disabled={redeemingId === r.id || (data.account_demo.balance_points < r.points_required)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition"
                >
                  {redeemingId === r.id ? "Memproses..." : "Tukar Reward"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
