"use client";

import { useEffect, useState } from "react";
import {
  Users2,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  Building,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getNetworkFGD } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function FGDNationalPage() {
  const [data, setData] = useState<{ events: any[]; recommendations: any[] }>({
    events: [],
    recommendations: [],
  });

  useEffect(() => {
    loadFGD();
  }, []);

  const loadFGD = async () => {
    try {
      const res = await getNetworkFGD();
      setData(res || { events: [], recommendations: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const currentEvent = data.events[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Forum Group Discussion (FGD) Staf Ahli Nasional</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Konsensus Kebijakan
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agenda pembahasan, formulasi usulan lintas wilayah, dan policy brief bersama kepada Pemerintah Pusat.
          </p>
        </div>
      </div>

      {/* Featured Event Card */}
      {currentEvent && (
        <Panel className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  Agenda Utama
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                  {currentEvent.status}
                </Badge>
              </div>

              <h3 className="font-extrabold text-base lg:text-lg text-slate-900 dark:text-white leading-snug">
                {currentEvent.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tema: <strong>{currentEvent.theme}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-500" />
                  {new Date(currentEvent.event_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-500" />
                  {currentEvent.location}
                </span>
                <span>Penyelenggara: {currentEvent.organizer}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shrink-0 min-w-[200px] space-y-1">
              <div className="text-2xl font-extrabold text-indigo-600">
                {currentEvent.submissions_count} / {currentEvent.invited_regions_count}
              </div>
              <div className="text-xs text-slate-500 font-medium">Usulan Daerah Diterima</div>
              <div className="text-[11px] text-emerald-600 font-semibold pt-1">Partisipasi 76.3%</div>
            </div>
          </div>

          {currentEvent.summary_consensus && (
            <div className="mt-4 p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
              <span className="font-bold block mb-1">Ringkasan Konsensus Sementara:</span>
              <p className="leading-relaxed">{currentEvent.summary_consensus}</p>
            </div>
          )}
        </Panel>
      )}

      {/* Matriks Rekomendasi Bersama */}
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm">Matriks Rekomendasi Kebijakan Hasil Konsensus Staf Ahli</h3>
            <p className="text-xs text-slate-500">Usulan konkret yang siap diserahkan kepada Kementerian Keuangan & Kemendagri</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Pilar: {rec.pillar}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px]">
                  Tingkat Konsensus: {rec.consensus_score_pct}%
                </span>
              </div>

              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {rec.proposal_text}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                <span>Tujuan Kebijakan: <strong>{rec.addressed_ministry}</strong></span>
                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 text-[10px]">
                  {rec.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
