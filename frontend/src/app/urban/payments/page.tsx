"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileText,
  RefreshCw,
  Building,
  HelpCircle,
} from "lucide-react";
import { getPaymentReadiness } from "@/lib/api";

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getPaymentReadiness()
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
            <ShieldAlert className="text-amber-600" size={26} /> Kesiapan Tata Kelola Denda & Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modul pengawasan kepatuhan hukum fiskal daerah dan audit penerimaan resmi Kas Daerah.
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

      {/* Main Status Badge Alert */}
      <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 font-extrabold text-xs tracking-wider">
          <Lock size={14} /> STATUS: SIMULATION / NOT ENABLED FOR COLLECTION
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
          Kanal Penagihan Denda Langsung Belum Diaktifkan
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {data?.legal_notice ||
            "Sesuai ketentuan perundang-undangan dan tata kelola keuangan negara, aplikasi Wasdal tidak memungut, menampung, atau mengelola dana denda/retribusi pada wallet aplikasi. Seluruh penetapan sanksi wajib melalui proses yudisial/sidang tipiring resmi dan pembayaran langsung ke Kas Daerah."}
        </p>
      </div>

      {/* Workflow Architecture Diagram */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={16} className="text-blue-600" /> Alur Standar Tata Kelola Sanksi & Pembayaran Resmi
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">1. Deteksi & Laporan</span>
            <p className="text-[11px] text-slate-500">Laporan hambatan trotoar atau utilitas dicatat sebagai candidate event.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">2. Verifikasi Lapangan</span>
            <p className="text-[11px] text-slate-500">Petugas berwenang (Satpol PP/Dishub) memeriksa fisik & dasar hukum Perda.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">3. Penetapan Resmi</span>
            <p className="text-[11px] text-slate-500">Surat peringatan / penetapan resmi diterbitkan oleh pejabat yang berwenang.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">4. Rekonsiliasi Kasda</span>
            <p className="text-[11px] text-slate-500">Penyetoran hanya ke rekening Kas Daerah BJB / Bapenda, diaudit berkala.</p>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Audit Pengawasan Kepatuhan</h4>
          <span className="text-xs text-slate-400">Pencatatan rekam jejak transparansi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">No. Referensi</th>
                <th className="py-3 px-4">Subjek / Kasus</th>
                <th className="py-3 px-4">Dasar Hukum</th>
                <th className="py-3 px-4">Status Penetapan</th>
                <th className="py-3 px-4">Kanal Resmi</th>
                <th className="py-3 px-4">Catatan Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.records?.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.reference_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{r.subject_title}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.legal_basis_check}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                      {r.determination_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{r.official_channel}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs">{r.audit_notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
