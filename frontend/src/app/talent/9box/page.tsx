"use client";

import { useEffect, useState } from "react";
import {
  Grid3X3,
  Filter,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";
import { getTalentNineBox } from "@/lib/api";
import type { NineBoxData } from "@/types/wasdal";

export default function NineBoxPage() {
  const [data, setData] = useState<NineBoxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    getTalentNineBox()
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
            <Grid3X3 className="text-indigo-600" size={26} /> Matriks 9 Box Kinerja & Potensi (Talent Map)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi resmi pemetaan pegawai berdasarkan PermenPAN-RB No. 3 Tahun 2020 disahkan Komite Talenta Daerah.
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

      {/* Formula & Policy Banner */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 p-4 text-xs flex items-start gap-3 text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-indigo-600 shrink-0" />
        <div>
          <span className="font-bold">Formula & Integritas Data:</span> {data?.formula || "Sumbu X: Evaluasi Kinerja SKP Resmi; Sumbu Y: Asesmen Kompetensi Terakreditasi BKN"}. AI dilarang menempatkan atau memindahkan posisi ASN dalam 9-Box secara otomatis tanpa penetapan resmi Tim Penilai Kinerja & Komite Talenta.
        </div>
      </div>

      {/* 9-Box Grid Layout (3 rows of 3 columns) */}
      {/* Row 1: Potensi Tinggi -> Box 7, Box 8, Box 9 */}
      {/* Row 2: Potensi Sedang -> Box 4, Box 5, Box 6 */}
      {/* Row 3: Potensi Rendah -> Box 1, Box 2, Box 3 */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
          <span>&uarr; SUMBU Y: POTENSI ASN (ASESMEN RESMI BKN)</span>
          <span>SUMBU X: KINERJA ASN (SKP RESMI) &rarr;</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((boxNum) => {
            const box = data?.boxes?.find((b) => b.box_number === boxNum);
            const isTop = boxNum === 9;
            const isSelected = selectedBox === boxNum;

            return (
              <div
                key={boxNum}
                onClick={() => setSelectedBox(selectedBox === boxNum ? null : boxNum)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                  isSelected
                    ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md"
                    : isTop
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      KOTAK {boxNum}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {box?.members.length ?? 0} ASN
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight mb-1">
                    {box?.meta.title}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    Kinerja: {box?.meta.perf} • Potensi: {box?.meta.pot}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500">
                  {box?.members && box.members.length > 0 ? (
                    <div className="space-y-0.5">
                      {box.members.slice(0, 2).map((m) => (
                        <div key={m.id} className="truncate font-medium text-slate-700 dark:text-slate-300">
                          • {m.full_name}
                        </div>
                      ))}
                      {box.members.length > 2 && (
                        <div className="text-[10px] text-indigo-600 font-semibold">
                          +{box.members.length - 2} pegawai lainnya
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Belum ada pegawai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Box Drawer / Detail List */}
      {selectedBox && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Daftar Pegawai ASN di Kotak {selectedBox}: {data?.boxes?.find((b) => b.box_number === selectedBox)?.meta.title}
            </h4>
            <button onClick={() => setSelectedBox(null)} className="text-xs text-slate-400 hover:text-slate-600">✕ Tutup</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Nama Lengkap & NIP</th>
                  <th className="py-2.5 px-3">Jabatan</th>
                  <th className="py-2.5 px-3">Unit Kerja / OPD</th>
                  <th className="py-2.5 px-3 text-center">Skor Kinerja (SKP)</th>
                  <th className="py-2.5 px-3 text-center">Skor Potensi (Asesmen)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.boxes?.find((b) => b.box_number === selectedBox)?.members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.full_name}</div>
                      <div className="font-mono text-[10px] text-slate-400">NIP: {m.nip}</div>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{m.position}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{m.agency_opd}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">{m.performance_score}</td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-600">{m.potential_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
