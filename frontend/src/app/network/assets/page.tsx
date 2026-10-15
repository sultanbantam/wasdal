"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  Building,
  Clock,
  Sparkles,
  Users2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { getNetworkAssets, getNetworkRegions } from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

export default function StrategicAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const list = await getNetworkAssets();
      setAssets(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Aset Strategis & Potensi Pemanfaatan Bersama</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Optimalisasi BMD
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inventaris strategis tingkat kebijakan untuk mencegah aset idle dan membuka ruang kolaborasi fasilitas antardaerah.
          </p>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((a) => (
          <Panel key={a.id} className="border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {a.asset_type}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {a.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{a.location}</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Kondisi: {a.condition}</Badge>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-500">Tingkat Utilisasi Fasilitas:</span>
                  <span className={a.utilization_level_pct < 60 ? "text-amber-600" : "text-emerald-600"}>
                    {a.utilization_level_pct}% (Potensi Idle)
                  </span>
                </div>
                <ProgressBar value={a.utilization_level_pct} tone={a.utilization_level_pct < 60 ? "warning" : "success"} />
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Pola Waktu Kosong:</strong> {a.idle_time_pattern}
              </div>

              <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
                <strong>Peluang Pemanfaatan Bersama:</strong> {a.shared_use_potential}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Pengelola: {a.managing_agency}</span>
              <span className="font-medium text-indigo-600">{a.required_followup}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
