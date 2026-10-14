"use client";

import { useEffect, useState } from "react";
import {
  Cable,
  Filter,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { getUrbanCables, getUrbanSegments, registerUrbanCable } from "@/lib/api";
import type { UtilityAssetItem } from "@/types/wasdal";

export default function CablesPage() {
  const [cables, setCables] = useState<UtilityAssetItem[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedSegment, setSelectedSegment] = useState("");
  const [utilityType, setUtilityType] = useState("Fiber Optik / Telekomunikasi");
  const [visualCondition, setVisualCondition] = useState("Semrawut / Kusut");
  const [heightMeters, setHeightMeters] = useState("4.2");
  const [notes, setNotes] = useState("");
  const [permitRef, setPermitRef] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([getUrbanCables(), getUrbanSegments()])
      .then(([cableData, segData]) => {
        setCables(cableData);
        setSegments(segData);
        if (segData.length > 0) setSelectedSegment(segData[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSegment) return;
    setSubmitting(true);
    try {
      await registerUrbanCable({
        segment_id: selectedSegment,
        utility_type: utilityType,
        visual_condition: visualCondition,
        height_meters: heightMeters ? parseFloat(heightMeters) : undefined,
        notes: notes,
        permit_reference: permitRef || undefined,
      });
      setShowModal(false);
      setNotes("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal mendaftarkan kabel utilitas.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCables = cables.filter((c) => {
    const matchSearch =
      c.street_name.toLowerCase().includes(search.toLowerCase()) ||
      c.operator_name.toLowerCase().includes(search.toLowerCase()) ||
      c.asset_code.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter ? c.risk_level === riskFilter : true;
    return matchSearch && matchRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Cable className="text-blue-600" size={26} /> Paspor Utilitas Digital (Kabel.ID)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Inventaris digital koridor kabel udara, tiang, dan Utility Clutter Index Kota Tangerang Selatan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus size={16} /> Paspor Kabel Baru
          </button>
        </div>
      </div>

      {/* AI Guardrail Info Banner */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4 text-xs flex items-start gap-3 text-blue-900 dark:text-blue-200">
        <Sparkles className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
        <div>
          <span className="font-bold">Utility Clutter Index & AI Guardrail:</span> AI menganalisis foto dan parameter teknis kabel untuk mendeteksi potensi kabel semrawut atau menggantung rendah. Namun, AI dilarang menyatakan kabel mati atau memerintahkan pemotongan fisik tanpa konfirmasi operator pemilik dan izin sah instansi berwenang.
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode paspor, operator, atau koridor jalan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="">Semua Tingkat Risiko</option>
            <option value="Critical">Critical (Kritis)</option>
            <option value="High">High (Tinggi)</option>
            <option value="Low">Low (Aman)</option>
          </select>
        </div>
      </div>

      {/* Cable Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode Paspor</th>
                <th className="py-3 px-4">Koridor / Ruas</th>
                <th className="py-3 px-4">Operator / Pemilik</th>
                <th className="py-3 px-4 text-center">Clutter Index</th>
                <th className="py-3 px-4">Kondisi Visual</th>
                <th className="py-3 px-4">Status Aktif</th>
                <th className="py-3 px-4">Tinggi & Tiang</th>
                <th className="py-3 px-4">Tindakan Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCables.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan kabel utilitas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredCables.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {c.asset_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{c.street_name}</div>
                      <div className="text-[10px] text-slate-400">{c.district}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{c.operator_name}</span>
                      <div className="text-[10px] text-slate-400">{c.ownership_status}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          c.clutter_index > 65
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : c.clutter_index > 35
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {c.clutter_index}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{c.visual_condition}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.active_status === "Active confirmed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {c.active_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{c.height_meters ? `${c.height_meters} meter` : "-"}</div>
                      <div className="text-[10px] text-slate-400">{c.pole_number || "Tiang Bersama"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.last_action || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Paspor Kabel */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pendaftaran Paspor Kabel (Kabel.ID)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Koridor Ruas Jalan</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                >
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>{s.street_name} ({s.district})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kondisi Visual</label>
                  <select
                    value={visualCondition}
                    onChange={(e) => setVisualCondition(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="Rapi / Tertata">Rapi / Tertata</option>
                    <option value="Semrawut / Kusut">Semrawut / Kusut</option>
                    <option value="Menggantung Rendah (< 4.5m)">Menggantung Rendah (&lt; 4.5m)</option>
                    <option value="Putus / Terjuntai">Putus / Terjuntai</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Ketinggian Kabel (meter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={heightMeters}
                    onChange={(e) => setHeightMeters(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Catatan Lapangan & Dugaan Masalah</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Misal: Kabel menggelantung di atas akses masuk gang, membahayakan kendaraan tinggi..."
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Nomor Rujukan Rekomendasi/Izin</label>
                <input
                  type="text"
                  placeholder="Contoh: IZIN-DISPERKIM-2026/044"
                  value={permitRef}
                  onChange={(e) => setPermitRef(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {submitting ? "Menganalisis & Menyimpan..." : "Hitung Clutter & Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
