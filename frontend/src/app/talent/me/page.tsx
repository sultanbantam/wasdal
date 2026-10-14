"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  ShieldCheck,
  Building,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  FolderKanban,
  Edit3,
} from "lucide-react";
import { getMyTalentProfile, proposeDataCorrection } from "@/lib/api";
import type { TalentProfileItem } from "@/types/wasdal";

export default function MyProfilePage() {
  const [profile, setProfile] = useState<TalentProfileItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Correction form state
  const [showCorrection, setShowCorrection] = useState(false);
  const [fieldName, setFieldName] = useState("current_position");
  const [proposedValue, setProposedValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getMyTalentProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await proposeDataCorrection({
        field_name: fieldName,
        proposed_value: proposedValue,
        reason,
      });
      setMessage(res.message);
      setShowCorrection(false);
      setProposedValue("");
      setReason("");
    } catch (err) {
      console.error(err);
      alert("Gagal mengajukan usulan koreksi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <RefreshCw className="animate-spin text-indigo-600" size={28} />
        <p className="text-sm text-slate-500">Memuat profil pegawai ASN...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <UserCheck className="text-indigo-600" size={26} /> Profil Pegawai ASN
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data terpadu kualifikasi, riwayat jabatan, kinerja resmi, dan status pemetaan talenta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCorrection(!showCorrection)}
            className="flex items-center gap-1.5 px-4 py-2 border border-indigo-300 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-xs font-semibold transition"
          >
            <Edit3 size={15} /> Ajukan Koreksi Data Mandiri
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {profile?.verification_status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              NIP: {profile?.nip} • Golongan: {profile?.rank_group}
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-400 block">Unit Kerja / OPD</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{profile?.agency_opd}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">Jabatan Saat Ini</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{profile?.current_position}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">Skor SKP Kinerja Resmi</span>
            <span className="font-extrabold text-emerald-600 text-base">{profile?.performance_score_official} / 100</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">Skor Potensi (Asesmen BKN)</span>
            <span className="font-extrabold text-indigo-600 text-base">{profile?.potential_score_official} / 100</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] mb-1">Posisi Matriks 9-Box</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block text-xs">
              Kotak {profile?.nine_box_position} (Top Talent)
            </span>
          </div>
        </div>

        {/* Details: Pendidikan & Aspirasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <GraduationCap size={15} className="text-blue-600" /> Kualifikasi & Pendidikan
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Jenjang: <strong>{profile?.education_level}</strong> • Jurusan: <strong>{profile?.major}</strong>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Masa Kerja Jabatan: <strong>{profile?.years_in_position} tahun</strong>
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FolderKanban size={15} className="text-purple-600" /> Rekam Jejak Penugasan Khusus
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Aspirasi Karier: <strong>{profile?.career_aspirations || "Pengembangan pada jabatan kepemimpinan strategis"}</strong>
            </p>
            <div className="text-[11px] text-slate-500">
              Kelengkapan Berkas SIASN: <strong>{profile?.data_completeness_pct}% Lengkap</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Form Pengajuan Koreksi Data Mandiri */}
      {showCorrection && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 size={16} className="text-indigo-600" /> Form Usulan Koreksi Data Mandiri (Sistem Merit)
            </h3>
            <button onClick={() => setShowCorrection(false)} className="text-xs text-slate-400 hover:text-slate-600">Batal</button>
          </div>
          <p className="text-xs text-slate-500">
            ASN berhak mengajukan koreksi atas data riwayat jabatan, ijazah, atau sertifikat. Perubahan data resmi hanya disahkan setelah verifikasi berkas oleh admin kepegawaian BKPSDM.
          </p>

          <form onSubmit={handlePropose} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Kolom yang Dikoreksi</label>
                <select
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                >
                  <option value="current_position">Nama Jabatan</option>
                  <option value="education_level">Riwayat Pendidikan Terakhir</option>
                  <option value="certifications">Sertifikasi Kompetensi</option>
                  <option value="career_aspirations">Aspirasi Minat Karier</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Nilai / Data yang Seharusnya</label>
                <input
                  type="text"
                  placeholder="Ketik data yang benar sesuai dokumen SK / ijazah..."
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Alasan Koreksi & Rujukan Nomor SK/Sertifikat</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Misal: Penyesuaian dengan SK Kenaikan Pangkat Nomor 821.2/... yang telah terbit"
                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Send size={13} />
                {submitting ? "Mengirim..." : "Kirim Usulan ke BKPSDM"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
