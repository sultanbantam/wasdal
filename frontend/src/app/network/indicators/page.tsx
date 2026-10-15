"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Upload,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  Plus,
} from "lucide-react";
import { getNetworkIndicators, getNetworkRegions, importNetworkIndicators } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function IndicatorsPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [data, setData] = useState<{ definitions: any[]; values: any[] }>({ definitions: [], values: [] });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const list = await getNetworkRegions();
      setRegions(list || []);
      const tangsel = list.find((r: any) => r.code?.includes("36.74")) || list[0];
      if (tangsel) {
        setSelectedRegionId(tangsel.id);
        loadIndicators(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadIndicators = async (regionId: string, category?: string, year?: string) => {
    try {
      const y = year ? parseInt(year) : undefined;
      const res = await getNetworkIndicators(regionId, category || undefined, y);
      setData(res || { definitions: [], values: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = () => {
    loadIndicators(selectedRegionId, selectedCategory, selectedYear);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRegionId) return;

    setImporting(true);
    setImportResult(null);
    try {
      const res = await importNetworkIndicators(selectedRegionId, file);
      setImportResult(res);
      loadIndicators(selectedRegionId, selectedCategory, selectedYear);
    } catch (err: any) {
      alert("Gagal impor CSV: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const downloadSampleCsv = () => {
    const sample =
      "kode_indikator,nama_indikator,kategori,periode,nilai,satuan,sumber,status_data,catatan\n" +
      "IND_MAKRO_PE,Laju Pertumbuhan Ekonomi,Makro Ekonomi,2024,5.56,%,BPS Daerah,Terverifikasi Daerah,Data rilis resmi\n" +
      "IND_FISKAL_PAD,Rasio Kemandirian PAD,Fiskal & APBD,2024,51.8,%,BPKAD,Terverifikasi Daerah,Audit semester I\n" +
      "IND_SOSIAL_IPM,Indeks Pembangunan Manusia,Layanan Publik,2024,82.60,Skor,BPS,Terverifikasi Daerah,Capaian sangat tinggi\n";
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_indikator_daerah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Data Wilayah & Pusat Indikator</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              CSV Importer & Metadata
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Repositori fleksibel indikator makro, fiskal, dan layanan publik per periode dan sumber verifikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="ghost"
            onClick={downloadSampleCsv}
            className="text-xs h-8 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
          >
            <Download size={14} /> Unduh Template CSV
          </Button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition">
            <Upload size={14} />
            <span>{importing ? "Mengimpor..." : "Impor CSV/Excel"}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <Panel className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <div className="font-bold text-xs">
                Hasil Impor Data: {importResult.success_count} baris berhasil, {importResult.failed_count} baris gagal.
              </div>
            </div>
            <button onClick={() => setImportResult(null)} className="text-xs text-slate-400 hover:text-slate-600">
              Tutup
            </button>
          </div>
          {importResult.failed_details?.length > 0 && (
            <div className="mt-2 text-[11px] text-rose-600 space-y-1">
              <span className="font-semibold">Rincian Baris Gagal:</span>
              <ul className="list-disc pl-5">
                {importResult.failed_details.map((f: any, idx: number) => (
                  <li key={idx}>Baris {f.line}: {f.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      )}

      {/* Filter Bar */}
      <Panel className="p-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <Filter size={14} />
            <span>Filter Data:</span>
          </div>

          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              loadIndicators(e.target.value, selectedCategory, selectedYear);
            }}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">Semua Kategori</option>
            <option value="Makro Ekonomi">Makro Ekonomi</option>
            <option value="Fiskal & APBD">Fiskal & APBD</option>
            <option value="Layanan Publik">Layanan Publik</option>
            <option value="Sosial">Sosial</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">Semua Periode Tahun</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          <Button variant="primary" onClick={handleFilter} className="text-xs h-7.5 px-3">
            Terapkan
          </Button>
        </div>
      </Panel>

      {/* Indikator Table */}
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Daftar Capaian Indikator Terdata</h3>
          <span className="text-xs text-slate-500">{data.values.length} baris indikator</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Nama Indikator</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Periode</th>
                <th className="p-3">Nilai Capaian</th>
                <th className="p-3">Satuan</th>
                <th className="p-3">Sumber Data</th>
                <th className="p-3">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.values.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="p-3 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {v.indicator_code}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{v.indicator_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                      {v.category}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{v.year}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white text-sm">
                    {v.value}
                  </td>
                  <td className="p-3 text-slate-500">{v.unit}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{v.source}</td>
                  <td className="p-3">
                    <Badge
                      className={
                        v.status_data.includes("Terverifikasi")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                      }
                    >
                      {v.status_data}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
