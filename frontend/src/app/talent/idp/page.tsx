"use client";

import { useEffect, useState } from "react";
import {
  Target,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { getTalentIDPs, addTalentIDPActivity } from "@/lib/api";
import type { TalentIDPItem } from "@/types/wasdal";

export default function IDPPage() {
  const [plans, setPlans] = useState<TalentIDPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Activity form
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState("Pelatihan");
  const [competency, setCompetency] = useState("");

  const loadData = () => {
    setLoading(true);
    getTalentIDPs()
      .then((res) => {
        setPlans(res);
        if (res.length > 0) setSelectedPlanId(res[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || !actTitle) return;
    setSubmitting(true);
    try {
      await addTalentIDPActivity({
        idp_id: selectedPlanId,
        title: actTitle,
        activity_type: actType,
        competency_targeted: competency,
      });
      setShowModal(false);
      setActTitle("");
      setCompetency("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan aktivitas IDP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Target className="text-indigo-600" size={26} /> Individual Development Plan (IDP)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rencana pengembangan kompetensi terarah ASN berdasarkan prinsip 70:20:10 (Penugasan, Mentoring, dan Pelatihan).
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
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus size={16} /> Tambah Aktivitas IDP
          </button>
        </div>
      </div>

      {/* IDP Cards List */}
      <div className="space-y-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.employee_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    {p.approval_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tahun Rencana: <strong>{p.year}</strong> • Sasaran Karier: <strong>{p.target_career_objective}</strong>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Progres Keseluruhan</span>
                <span className="text-xl font-black text-indigo-600">{p.overall_progress_pct}%</span>
              </div>
            </div>

            {p.mentor_or_coach && (
              <div className="text-xs text-slate-600 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center gap-2">
                <UserCheck size={14} className="text-indigo-600" />
                <span>Mentor / Atasan Pembimbing: <strong>{p.mentor_or_coach}</strong></span>
              </div>
            )}

            {/* Activities Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Aktivitas Pengembangan yang Ditetapkan:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Bentuk Pengembangan</th>
                      <th className="py-2.5 px-3">Nama Aktivitas / Kegiatan</th>
                      <th className="py-2.5 px-3">Target Kompetensi</th>
                      <th className="py-2.5 px-3">Tenggat Waktu</th>
                      <th className="py-2.5 px-3">Status Progres</th>
                      <th className="py-2.5 px-3 text-center">Verifikasi Atasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {p.activities.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {a.activity_type}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{a.title}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{a.competency_targeted}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {a.deadline ? new Date(a.deadline).toLocaleDateString("id-ID") : "Sesuai Jadwal"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              a.progress_status === "Completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {a.progress_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {a.verified ? (
                            <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1">
                              <CheckCircle2 size={13} /> Sah
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Menunggu Bukti</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Aktivitas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tambah Aktivitas Pengembangan (IDP)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Rencana IDP Pegawai</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.employee_name} ({p.year})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Bentuk Pengembangan</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="Pelatihan Klasikal / E-learning">Pelatihan / Diklat</option>
                    <option value="Coaching / Mentoring">Coaching / Mentoring</option>
                    <option value="Penugasan Khusus">Penugasan Khusus / Task Force</option>
                    <option value="Magang / Benchmarking">Magang / Benchmarking</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Target Kompetensi</label>
                  <input
                    type="text"
                    placeholder="Misal: Kepemimpinan Lintas Sektor"
                    value={competency}
                    onChange={(e) => setCompetency(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Nama Aktivitas / Kegiatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pelatihan Manajemen Risiko SPBE Angkatan II"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
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
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {submitting ? "Menyimpan..." : "Simpan Aktivitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
