"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  FileSearch,
  UserCheck,
} from "lucide-react";
import { Badge, Button, Panel } from "@/components/ui";

const validationStages = [
  { stage: "Draft", desc: "Data sedang diisi oleh Staf Ahli atau Kontributor OPD.", color: "text-slate-500" },
  { stage: "Diajukan", desc: "Data diajukan untuk verifikasi kelengkapan internal.", color: "text-amber-500" },
  { stage: "Terverifikasi Daerah", desc: "Diverifikasi oleh Admin Daerah & Staf Ahli Daerah.", color: "text-indigo-500" },
  { stage: "Terverifikasi Substansi", desc: "Lolos telaah metodologi & akurasi data lintas dinas.", color: "text-emerald-500" },
  { stage: "Dipublikasikan", desc: "Tampil di agregat nasional dan bahan perumusan kebijakan.", color: "text-purple-500" },
];

const mockAuditLogs = [
  {
    id: "aud-1",
    time: "Hari ini, 10:14",
    user: "Drs. H. Heru Sudarmanto, M.Si",
    role: "Staf Ahli Kepala Daerah",
    action: "SUBMIT_DIAGNOSIS",
    detail: "Mengajukan lembar diagnosis kemandirian fiskal dan usulan Decision Required penetapan Perwal Aset.",
  },
  {
    id: "aud-2",
    time: "Hari ini, 09:30",
    user: "Ahmad Fauzi, S.Kom",
    role: "Admin Daerah",
    action: "UPDATE_PROFILE",
    detail: "Memperbarui indikator kelengkapan profil wilayah Tangerang Selatan (94%).",
  },
  {
    id: "aud-3",
    time: "Kemarin, 14:20",
    user: "Kontributor Bapenda",
    role: "Kontributor OPD",
    action: "IMPORT_INDICATORS",
    detail: "Mengimpor 9 baris indikator makro dan rasio fiskal tahun anggaran 2022-2024.",
  },
];

export default function DataValidationPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Validasi, Kontrol Kualitas & Jejak Audit (Audit Trail)</h2>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300">
              Integritas Data
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prinsip pemisahan validasi format, verifikasi daerah, dan verifikasi substansi dengan pencatatan jejak audit.
          </p>
        </div>
      </div>

      {/* Validation Pipeline Stepper */}
      <Panel>
        <h3 className="font-bold text-sm mb-3">Hierarki Tahapan Kontrol Kualitas Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {validationStages.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1 text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span className={s.color}>{s.stage}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Audit Trail Log */}
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-indigo-600" />
            <h3 className="font-bold text-sm">Riwayat Perubahan Data Sensitif (Audit Trail)</h3>
          </div>
          <span className="text-xs text-slate-500">Log waktu nyata tersimpan di server</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockAuditLogs.map((log) => (
            <div key={log.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{log.user}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {log.role}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600">{log.action}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.detail}</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
