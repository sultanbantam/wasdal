"use client";

import { useEffect, useState } from "react";
import {
  Ban,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Car,
  AlertCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getUrbanObstructions, reportUrbanObstruction, verifyUrbanObstruction } from "@/lib/api";
import type { UrbanObstructionItem } from "@/types/wasdal";

export default function ObstructionsPage() {
  const [items, setItems] = useState<UrbanObstructionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("-6.3112");
  const [longitude, setLongitude] = useState("106.7562");

  const loadData = () => {
    setLoading(true);
    getUrbanObstructions(statusFilter || undefined)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reportUrbanObstruction({
        title,
        description,
        location_name: locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        source: "Laporan Petugas / Warga",
      });
      setShowModal(false);
      setTitle("");
      setDescription("");
      setLocationName("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim laporan hambatan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id: string, newStatus: string) => {
    try {
      await verifyUrbanObstruction(id, {
        status: newStatus,
        notes: "Diverifikasi langsung oleh petugas pengawas lapangan Wasdal",
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal memverifikasi status laporan.");
    }
  };

  const filtered = items.filter((i) => {
    const matchSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location_name.toLowerCase().includes(search.toLowerCase()) ||
      i.obstruction_type.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Ban className="text-rose-600" size={26} /> Hambatan Trotoar & Parkir Liar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penanganan kendaraan di atas trotoar, lapak liar penghalang pejalan, dan pengamanan akses ramah difabel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus size={16} /> Lapor Hambatan Baru
          </button>
        </div>
      </div>

      {/* AI Guardrail Info */}
      <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-4 text-xs flex items-start gap-3 text-rose-900 dark:text-rose-200">
        <Sparkles className="w-5 h-5 mt-0.5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">Candidate Event & Verifikasi Lapangan:</span> AI menghasilkan label <em>candidate event</em> dengan skor keyakinan, bukan vonis pelanggaran hukum. Petugas lapangan wajib melakukan verifikasi fisik sebelum penerbitan peringatan resmi atau tindak lanjut Satpol PP/Dishub.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari lokasi, jenis hambatan, atau kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none"
          >
            <option value="">Semua Status Laporan</option>
            <option value="Pending Verification">Menunggu Verifikasi</option>
            <option value="Verified">Terverifikasi</option>
            <option value="In Action">Dalam Tindak Lanjut</option>
            <option value="Resolved">Selesai Ditertibkan</option>
          </select>
        </div>
      </div>

      {/* Obstruction Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.obstruction_type}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : item.status === "Pending Verification"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
                <MapPin size={13} className="text-rose-500 shrink-0" />
                <span className="truncate">{item.location_name}</span>
              </div>

              <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-0.5">Dampak Aksesibilitas:</span>
                {item.accessibility_impact}
              </div>

              {item.ai_candidate_flag && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-600 font-medium">
                  <Sparkles size={12} /> AI Confidence: {(item.ai_confidence * 100).toFixed(0)}% (Candidate Event)
                </div>
              )}
            </div>

            {/* Actions for Field Officers */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">{item.responsible_agency}</span>
              {item.status === "Pending Verification" && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleVerify(item.id, "Rejected")}
                    className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 text-[11px]"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleVerify(item.id, "Verified")}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                  >
                    Verifikasi Valid
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lapor Hambatan Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Lapor Hambatan Trotoar / Parkir Liar</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleReport} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Judul Kejadian</label>
                <input
                  type="text"
                  placeholder="Contoh: Mobil parkir menutup jalur pemandu depan ruko"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Deskripsi Hambatan & Situasi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan kondisi, jenis kendaraan / barang, dan hambatan bagi pejalan kaki..."
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Nama Lokasi / Patokan</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Ir. H. Juanda No. 45 Ciputat"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
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
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  {submitting ? "Menganalisis..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
