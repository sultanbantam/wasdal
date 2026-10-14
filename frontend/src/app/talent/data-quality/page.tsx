"use client";

import { useEffect, useState } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getTalentDataQuality, resolveDataQualityIssue } from "@/lib/api";

export default function DataQualityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getTalentDataQuality()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveDataQualityIssue(id, "Telah diverifikasi sesuai berkas fisik dan sinkronisasi SIASN BKN.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status isu.");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Database className="text-indigo-600" size={26} /> Kualitas Data & Audit Kepegawaian
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan keandalan data Manajemen Talenta: pencegahan data conflicting, unverified, dan sinkronisasi SIASN BKN.
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

      {/* Source Systems Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.sources?.map((s: any, idx: number) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{s.source_name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">{s.data_type}</p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              Sinkronisasi Terakhir: {s.last_sync ? new Date(s.last_sync).toLocaleString("id-ID") : "-"}
            </div>
          </div>
        ))}
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Anomali & Koreksi Kualitas Data</h4>
          <span className="text-xs text-slate-400">{data?.issues?.length ?? 0} catatan ditemukan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Pegawai ASN</th>
                <th className="py-3 px-4">Unit Kerja (OPD)</th>
                <th className="py-3 px-4">Jenis Isu Data</th>
                <th className="py-3 px-4">Deskripsi Anomali</th>
                <th className="py-3 px-4">PIC Koreksi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.issues?.map((i: any) => (
                <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{i.employee_name}</div>
                    <div className="font-mono text-[10px] text-slate-400">NIP: {i.nip}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{i.agency_opd}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        i.issue_type === "Conflicting"
                          ? "bg-rose-100 text-rose-700"
                          : i.issue_type === "Incomplete"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {i.issue_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">{i.description}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{i.correction_owner}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        i.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {i.status !== "Resolved" ? (
                      <button
                        onClick={() => handleResolve(i.id)}
                        disabled={resolvingId === i.id}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-semibold text-[11px] transition"
                      >
                        {resolvingId === i.id ? "Memproses..." : "Sahkan Verifikasi"}
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-xs flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} /> Selesai
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
