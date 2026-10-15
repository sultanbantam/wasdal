"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getNetworkIssues, getNetworkRegions, createNetworkIssue } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function StrategicIssuesPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [issues, setIssues] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Fiskal");
  const [locationName, setLocationName] = useState("Seluruh Wilayah Kota");
  const [targetOpd, setTargetOpd] = useState("");
  const [affectedGroups, setAffectedGroups] = useState("Masyarakat umum dan pelaku UMKM");
  const [urgencyLevel, setUrgencyLevel] = useState("Tinggi");
  const [impactLevel, setImpactLevel] = useState("Tinggi");
  const [picName, setPicName] = useState("");
  const [deadlineTarget, setDeadlineTarget] = useState("");
  const [decisionRequired, setDecisionRequired] = useState(false);

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
        loadIssues(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadIssues = async (regionId: string, cat?: string, urg?: string) => {
    try {
      const items = await getNetworkIssues(regionId, cat || undefined, urg || undefined);
      setIssues(items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !targetOpd) {
      alert("Harap lengkapi judul, ringkasan isu, dan OPD penanggung jawab!");
      return;
    }

    try {
      await createNetworkIssue({
        region_id: selectedRegionId,
        title,
        summary,
        category,
        location_name: locationName,
        target_opd: targetOpd,
        affected_groups: affectedGroups,
        urgency_level: urgencyLevel,
        impact_level: impactLevel,
        pic_name: picName,
        deadline_target: deadlineTarget,
        decision_required: decisionRequired,
      });
      setIsModalOpen(false);
      resetForm();
      loadIssues(selectedRegionId, filterCategory, filterUrgency);
    } catch (err: any) {
      alert("Gagal menambahkan isu strategis: " + err.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setTargetOpd("");
    setPicName("");
    setDeadlineTarget("");
    setDecisionRequired(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Isu Strategis Daerah (Formula 5W1H)</h2>
            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300">
              Prioritas & Mitigasi
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inventarisasi isu kritis kewilayahan, OPD penanggung jawab, sasaran RPJMD terkait, dan kebutuhan keputusan pimpinan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {regions.length > 1 && (
            <select
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value);
                loadIssues(e.target.value, filterCategory, filterUrgency);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <Button
            onClick={() => setIsModalOpen(!isModalOpen)}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            <span>Tambah Isu Strategis</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel className="p-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <Filter size={14} />
            <span>Filter Kategori:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              loadIssues(selectedRegionId, e.target.value, filterUrgency);
            }}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">Semua Kategori</option>
            <option value="Fiskal">Fiskal & Keuangan</option>
            <option value="Infrastruktur">Infrastruktur & Ruang</option>
            <option value="Layanan Publik">Layanan Publik</option>
            <option value="Tata Ruang">Tata Ruang & Lingkungan</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => {
              setFilterUrgency(e.target.value);
              loadIssues(selectedRegionId, filterCategory, e.target.value);
            }}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="">Semua Urgensi</option>
            <option value="Kritis">Kritis</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
          </select>
        </div>
      </Panel>

      {/* Modal / Form Input */}
      {isModalOpen && (
        <Panel className="border-indigo-300 dark:border-indigo-800 shadow-lg">
          <h3 className="font-bold text-sm mb-3">Form Input Isu Strategis Baru (5W1H)</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Judul Isu Strategis</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: Optimalisasi Kemandirian Fiskal & Harmonisasi PBJT"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Ringkasan Masalah (Summary)</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Uraian ringkas situasi lapangan dan dampak bagi daerah..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold block mb-1">Kategori Isu</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Fiskal">Fiskal & Keuangan</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Tata Ruang">Tata Ruang & Lingkungan</option>
                  <option value="Layanan Publik">Layanan Publik</option>
                  <option value="Pangan">Pangan & Inflasi</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Tingkat Urgensi</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Kritis">Kritis</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">OPD Penanggung Jawab</label>
                <input
                  type="text"
                  value={targetOpd}
                  onChange={(e) => setTargetOpd(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Bapenda, Dinas PUPR"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold block mb-1">Lokasi Fokus</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">PIC Pejabat / Bidang</label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Kabid Pajak Daerah"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Target Penyelesaian</label>
                <input
                  type="text"
                  value={deadlineTarget}
                  onChange={(e) => setDeadlineTarget(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Triwulan IV 2026"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="decReq"
                checked={decisionRequired}
                onChange={(e) => setDecisionRequired(e.target.checked)}
                className="rounded accent-rose-600"
              />
              <label htmlFor="decReq" className="font-semibold text-rose-600 cursor-pointer">
                Memerlukan Keputusan Pimpinan Daerah (Masuk ke antrean Decision Required)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                Simpan Isu Strategis
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {issues.map((i) => (
          <Panel
            key={i.id}
            className="border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      i.urgency_level === "Kritis" || i.priority_score > 90
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                    }`}
                  >
                    Skor: {i.priority_score} • {i.urgency_level}
                  </span>
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 text-[10px]">
                    {i.category}
                  </Badge>
                  {i.decision_required && (
                    <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 text-[10px]">
                      Decision Required
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {i.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {i.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-indigo-500" />
                    {i.location_name}
                  </span>
                  <span>OPD: <strong>{i.target_opd}</strong></span>
                  {i.pic_name && <span>PIC: {i.pic_name}</span>}
                  {i.deadline_target && <span>Target: {i.deadline_target}</span>}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {i.status}
                </span>
                <Link href="/network/diagnoses">
                  <Button variant="ghost" className="text-xs h-7 text-indigo-600 hover:text-indigo-500">
                    Buka Diagnosis &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
