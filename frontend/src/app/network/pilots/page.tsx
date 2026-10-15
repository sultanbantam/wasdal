"use client";

import { useEffect, useState } from "react";
import {
  Rocket,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getNetworkPilots, getNetworkRegions } from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

export default function PilotProjectsPage() {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPilots();
  }, []);

  const loadPilots = async () => {
    setLoading(true);
    try {
      const list = await getNetworkPilots();
      setPilots(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Proyek Percontohan (Pilot Projects) Inovatif</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Evaluasi Berjenjang (Gate Review)
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uji coba solusi terukur di lokasi percontohan dengan indikator keberhasilan sebelum diperluas atau direplikasi.
          </p>
        </div>
      </div>

      {/* Template Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <Panel className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900">
          <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">
            1. Dividen Efisiensi Gedung
          </div>
          <p className="text-[11px] text-slate-500">
            Audit energi & solar rooftop gedung kantor untuk penghematan belanja operasional rutin.
          </p>
        </Panel>

        <Panel className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-slate-900">
          <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">
            2. Satu Aset Banyak Manfaat
          </div>
          <p className="text-[11px] text-slate-500">
            Pemanfaatan aula & fasilitas publik idle untuk ruang inkubasi dan etalase UMKM pemula.
          </p>
        </Panel>

        <Panel className="border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-slate-900">
          <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">
            3. Pajak Mudah, Usaha Tumbuh
          </div>
          <p className="text-[11px] text-slate-500">
            Integrasi digital kasir PBJT disertai insentif cashback retribusi dan perizinan kilat.
          </p>
        </Panel>
      </div>

      {/* Pilots List */}
      <div className="space-y-4">
        {pilots.map((p) => (
          <Panel key={p.id} className="border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                    {p.template_type}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 text-[10px]">
                    {p.evaluation_gate}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {p.title}
                </h3>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>
                    <strong>Lokasi Pelaksanaan:</strong> {p.location} • Durasi: <strong>{p.duration_months} Bulan</strong>
                  </div>
                  <div>
                    <strong>Tim Pengelola (PIC):</strong> {p.pic_team}
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px]">
                    <strong>Indikator Keberhasilan & Bukti:</strong> {p.success_indicators}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0 sm:min-w-[180px]">
                <div className="text-right w-full">
                  <div className="flex justify-between sm:justify-end gap-2 text-xs font-semibold mb-1">
                    <span className="text-slate-500">Progress:</span>
                    <span className="text-indigo-600">{p.progress_pct}%</span>
                  </div>
                  <ProgressBar value={p.progress_pct} tone="primary" />
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
