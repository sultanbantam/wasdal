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
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  PlusCircle,
} from "lucide-react";
import {
  getNetworkIndicators,
  getNetworkRegions,
  importNetworkIndicators,
  DEFAULT_DEMO_REGIONS,
  DEFAULT_TANGSEL_INDICATORS,
} from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

interface IndicatorItem {
  id?: string;
  indicator_code: string;
  indicator_name?: string;
  name?: string;
  category: string;
  year: number;
  value: number | string;
  unit: string;
  source: string;
  status_data?: string;
  status?: string;
  notes?: string;
}

export default function IndicatorsPage() {
  const [regions, setRegions] = useState<any[]>(DEFAULT_DEMO_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("reg-tangsel-demo");
  const [data, setData] = useState<{ definitions: any[]; values: IndicatorItem[] }>({
    definitions: DEFAULT_TANGSEL_INDICATORS.definitions,
    values: DEFAULT_TANGSEL_INDICATORS.values as IndicatorItem[],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [notification, setNotification] = useState<string>("");

  // Modal Form State (Tambah & Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formCode, setFormCode] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("Makro Ekonomi");
  const [formYear, setFormYear] = useState<number>(2024);
  const [formValue, setFormValue] = useState<string>("");
  const [formUnit, setFormUnit] = useState<string>("%");
  const [formSource, setFormSource] = useState<string>("BPS Daerah");
  const [formStatus, setFormStatus] = useState<string>("Terverifikasi Daerah");
  const [formNotes, setFormNotes] = useState<string>("");

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const list = await getNetworkRegions();
      const finalRegions = list && list.length > 0 ? list : DEFAULT_DEMO_REGIONS;
      setRegions(finalRegions);
      const target = finalRegions.find((r: any) => r.code?.includes("36.74")) || finalRegions[0];
      if (target) {
        setSelectedRegionId(target.id);
        loadIndicators(target.id);
      } else {
        loadIndicators("reg-tangsel-demo");
      }
    } catch (err) {
      console.error(err);
      setRegions(DEFAULT_DEMO_REGIONS);
      setSelectedRegionId(DEFAULT_DEMO_REGIONS[0].id);
      loadIndicators(DEFAULT_DEMO_REGIONS[0].id);
    }
  };

  const loadIndicators = async (regionId: string, category?: string, year?: string) => {
    // 1. Check if user has saved custom indicators for this region in localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`wasdal_indicators_${regionId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            let filtered = parsed;
            if (category) filtered = filtered.filter((v: any) => v.category?.toLowerCase().includes(category.toLowerCase()));
            if (year) filtered = filtered.filter((v: any) => v.year?.toString() === year);
            setData({ definitions: DEFAULT_TANGSEL_INDICATORS.definitions, values: filtered });
            return;
          }
        }
      } catch (e) {}
    }

    // 2. Otherwise fetch from API / fallback
    try {
      const y = year ? parseInt(year) : undefined;
      const res = await getNetworkIndicators(regionId, category || undefined, y);
      if (res && res.values && res.values.length > 0) {
        setData(res);
      } else {
        filterFallbackData(category, y);
      }
    } catch (err) {
      filterFallbackData(category, year ? parseInt(year) : undefined);
    }
  };

  const filterFallbackData = (category?: string, year?: number) => {
    let vals = [...DEFAULT_TANGSEL_INDICATORS.values] as IndicatorItem[];
    let defs = [...DEFAULT_TANGSEL_INDICATORS.definitions];
    if (category) {
      vals = vals.filter((v) => v.category.toLowerCase().includes(category.toLowerCase()));
      defs = defs.filter((d) => d.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (year) {
      vals = vals.filter((v) => v.year === year);
    }
    setData({ definitions: defs, values: vals });
  };

  const persistValues = (values: IndicatorItem[]) => {
    setData((prev) => ({ ...prev, values }));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`wasdal_indicators_${selectedRegionId}`, JSON.stringify(values));
      } catch (e) {}
    }
  };

  const handleFilter = () => {
    loadIndicators(selectedRegionId, selectedCategory, selectedYear);
  };

  const handleLoadTangselStandards = () => {
    const vals = DEFAULT_TANGSEL_INDICATORS.values as IndicatorItem[];
    persistValues(vals);
    setSelectedCategory("");
    setSelectedYear("");
    setNotification("Berhasil memuat 12 data indikator resmi Kota Tangerang Selatan!");
    setTimeout(() => setNotification(""), 6000);
  };

  const handleClearTable = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan tabel indikator untuk mengisi dari nol?")) {
      persistValues([]);
      setNotification("Tabel indikator telah dikosongkan. Silakan gunakan tombol '+ Tambah Indikator' untuk mengisi data baru.");
      setTimeout(() => setNotification(""), 6000);
    }
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingIndex(null);
    setFormCode("IND_" + Date.now().toString().slice(-4));
    setFormName("");
    setFormCategory("Makro Ekonomi");
    setFormYear(new Date().getFullYear());
    setFormValue("");
    setFormUnit("%");
    setFormSource("BPS Daerah");
    setFormStatus("Terverifikasi Daerah");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: IndicatorItem, index: number) => {
    setEditingIndex(index);
    setFormCode(item.indicator_code || item.id || "");
    setFormName(item.indicator_name || item.name || "");
    setFormCategory(item.category || "Makro Ekonomi");
    setFormYear(item.year || 2024);
    setFormValue(item.value?.toString() || "");
    setFormUnit(item.unit || "%");
    setFormSource(item.source || "");
    setFormStatus(item.status_data || item.status || "Terverifikasi Daerah");
    setFormNotes(item.notes || "");
    setIsModalOpen(true);
  };

  // Save Modal Form (Create or Update)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      alert("Harap isi Kode dan Nama Indikator!");
      return;
    }

    const newItem: IndicatorItem = {
      id: formCode.trim(),
      indicator_code: formCode.trim(),
      indicator_name: formName.trim(),
      name: formName.trim(),
      category: formCategory,
      year: Number(formYear) || 2024,
      value: formValue === "" ? 0 : Number(formValue) || formValue,
      unit: formUnit.trim() || "-",
      source: formSource.trim() || "OPD Terkait",
      status_data: formStatus,
      status: formStatus,
      notes: formNotes.trim(),
    };

    let updated: IndicatorItem[];
    if (editingIndex !== null) {
      updated = [...data.values];
      updated[editingIndex] = newItem;
      setNotification(`Indikator "${newItem.name}" berhasil diperbarui.`);
    } else {
      updated = [newItem, ...data.values];
      setNotification(`Indikator "${newItem.name}" berhasil ditambahkan ke tabel.`);
    }

    persistValues(updated);
    setIsModalOpen(false);
    setTimeout(() => setNotification(""), 5000);
  };

  // Delete Indicator
  const handleDeleteIndicator = (code: string, index: number) => {
    const itemToDelete = data.values[index];
    const itemName = itemToDelete?.indicator_name || itemToDelete?.name || code;
    if (confirm(`Apakah Anda yakin ingin menghapus indikator "${itemName}"?`)) {
      const updated = data.values.filter((_, idx) => idx !== index);
      persistValues(updated);
      setNotification(`Indikator "${itemName}" telah dihapus.`);
      setTimeout(() => setNotification(""), 4000);
    }
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
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Data Wilayah & Pusat Indikator</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Pengelolaan & Metadata Indikator
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Repositori fleksibel indikator makro, fiskal, dan layanan publik. Anda dapat mengisi, mengedit, maupun menghapus indikator di bawah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Tambah Indikator Baru */}
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Tambah Indikator Baru</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleLoadTangselStandards}
            className="text-xs h-8 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span className="hidden sm:inline">Muat 12 Standar Tangsel</span>
          </Button>

          <Button
            variant="ghost"
            onClick={downloadSampleCsv}
            className="text-xs h-8 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
          >
            <Download size={14} /> <span className="hidden sm:inline">Unduh CSV</span>
          </Button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition shadow-sm border border-slate-300 dark:border-slate-700">
            <Upload size={14} />
            <span>{importing ? "Mengimpor..." : "Impor CSV"}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

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
        </Panel>
      )}

      {/* Filter Bar */}
      <Panel className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            <select
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value);
                loadIndicators(e.target.value, selectedCategory, selectedYear);
              }}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
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
              className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="">Semua Kategori</option>
              <option value="Makro Ekonomi">Makro Ekonomi</option>
              <option value="Fiskal & APBD">Fiskal & APBD</option>
              <option value="Layanan Publik">Layanan Publik</option>
              <option value="Sosial">Sosial</option>
              <option value="Infrastruktur">Infrastruktur</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="">Semua Periode Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <Button variant="primary" onClick={handleFilter} className="text-xs h-7.5 px-3 bg-indigo-600 hover:bg-indigo-500">
              Terapkan
            </Button>

            {(selectedCategory || selectedYear) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedYear("");
                  loadIndicators(selectedRegionId, "", "");
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {data.values.length > 0 && (
              <button
                onClick={handleClearTable}
                className="text-xs text-rose-500 hover:text-rose-700 hover:underline"
              >
                Kosongkan Tabel
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* Indikator Table */}
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Daftar Capaian Indikator Terdata</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
              {data.values.length} baris indikator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Tambah Baris Indikator</span>
            </button>
          </div>
        </div>

        {data.values.length > 0 ? (
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
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.values.map((v, idx) => (
                  <tr key={v.id || v.indicator_code || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="p-3 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {v.indicator_code}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {v.indicator_name || v.name}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                        {v.category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{v.year}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white text-sm">
                      {v.value}
                    </td>
                    <td className="p-3 text-slate-500">{v.unit}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{v.source}</td>
                    <td className="p-3">
                      <Badge
                        className={
                          (v.status_data || v.status || "").includes("Terverifikasi")
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                        }
                      >
                        {v.status_data || v.status || "Terverifikasi Daerah"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v, idx)}
                          className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1 font-medium transition"
                          title="Edit Indikator"
                        >
                          <Pencil size={13} />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteIndicator(v.indicator_code || v.name || "", idx)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 font-medium transition"
                          title="Hapus Indikator"
                        >
                          <Trash2 size={13} />
                          <span className="hidden md:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <BarChart3 size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Belum Ada Indikator Terdaftar</p>
              <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                Tabel indikator untuk wilayah ini masih kosong. Anda dapat menambahkan indikator baru secara manual atau memuat indikator standar.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="primary" onClick={handleOpenCreate} className="text-xs bg-indigo-600 hover:bg-indigo-500">
                + Tambah Indikator Baru
              </Button>
              <Button variant="secondary" onClick={handleLoadTangselStandards} className="text-xs">
                Muat 12 Standar Tangsel
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* MODAL TAMBAH & EDIT INDIKATOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={20} />
                <h3 className="font-bold text-sm">
                  {editingIndex !== null ? "Edit Data Capaian Indikator" : "Tambah Indikator Daerah Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kode Indikator *</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="misal: IND_MAKRO_PE"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Kategori Indikator</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Makro Ekonomi">Makro Ekonomi</option>
                    <option value="Fiskal & APBD">Fiskal & APBD</option>
                    <option value="Layanan Publik">Layanan Publik</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Nama Indikator *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="misal: Laju Pertumbuhan Ekonomi"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Periode Tahun *</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    placeholder="2024"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Nilai Capaian *</label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="misal: 5.56"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Satuan *</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="misal: %, Rp Triliun, Skor"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Sumber Data</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="misal: BPS Daerah / BPKAD"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Status Verifikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Terverifikasi Daerah">Terverifikasi Daerah</option>
                    <option value="Terverifikasi Nasional">Terverifikasi Nasional</option>
                    <option value="Draft Daerah">Draft Daerah</option>
                    <option value="Menunggu Telaah">Menunggu Telaah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan / Metodologi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan sumber rilis, metodologi perhitungan, atau batas toleransi..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                  {editingIndex !== null ? "Simpan Perubahan" : "Tambahkan ke Tabel"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
