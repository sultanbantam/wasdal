"use client";

import { useState } from "react";
import {
  FileDown,
  Printer,
  FileSpreadsheet,
  FileText,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Badge, Button, Panel } from "@/components/ui";

const exportReports = [
  {
    id: "rep-1",
    title: "Profil & Indikator Lengkap Daerah",
    format: "PDF / XLSX",
    desc: "Rekapitulasi komprehensif identitas, demografi, indikator makro 3 tahun, dan kelengkapan data.",
    badge: "Tahunan",
  },
  {
    id: "rep-2",
    title: "Executive Summary & Policy Brief (5 Halaman)",
    format: "PDF / DOCX",
    desc: "Ringkasan eksekutif diagnosis wilayah, bottleneck RPJMD, dan rekomendasi strategis Staf Ahli.",
    badge: "Prioritas",
  },
  {
    id: "rep-3",
    title: "Peta Jalan Transformasi Fiskal & Kemandirian PAD",
    format: "PDF / PPTX",
    desc: "Dokumen strategi optimalisasi PBJT, dividen efisiensi gedung, dan usulan revisi formula DAU.",
    badge: "Fiskal",
  },
  {
    id: "rep-4",
    title: "Bahan & Policy Brief FGD Staf Ahli Nasional",
    format: "PDF / DOCX",
    desc: "Kompilasi usulan daerah untuk penyerahan naskah rekomendasi bersama ke Kemenkeu & Kemendagri.",
    badge: "Nasional",
  },
  {
    id: "rep-5",
    title: "Matriks Keputusan Pimpinan (Decision Required Trail)",
    format: "PDF / CSV",
    desc: "Daftar disposisi resmi Wali Kota/Sekda terhadap opsi intervensi taktis dan tindak lanjut OPD.",
    badge: "Audit",
  },
];

export default function NetworkExportPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (report: any) => {
    setDownloadingId(report.id);
    setDownloadSuccess(null);
    setTimeout(() => {
      // Simulate file download
      const content = `WASDAL JEJARING STAF AHLI DAERAH\nDokumen: ${report.title}\nTanggal Cetak: ${new Date().toLocaleString("id-ID")}\nStatus: Dokumen Resmi Terverifikasi\n`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
      setDownloadSuccess(`Dokumen "${report.title}" berhasil diunduh!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Laporan, Policy Brief & Generator Ekspor</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Siap Cetak & Eksekutif
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor data terverifikasi ke dalam format dokumen resmi, ringkasan pimpinan daerah, atau infografis cetak.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={handlePrint}
          className="text-xs h-8 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
        >
          <Printer size={14} /> Cetak Halaman (Print)
        </Button>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportReports.map((rep) => (
          <Panel
            key={rep.id}
            className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {rep.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono font-medium">{rep.format}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {rep.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {rep.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => handleDownload(rep)}
                disabled={downloadingId === rep.id}
                className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5"
              >
                <FileDown size={14} />
                <span>{downloadingId === rep.id ? "Menyiapkan Dokumen..." : "Unduh Dokumen Ekspor"}</span>
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
