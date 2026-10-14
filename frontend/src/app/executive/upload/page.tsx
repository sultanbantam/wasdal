"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, RefreshCw, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge, Button, Panel } from "@/components/ui";

export default function UploadRKPDPage() {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api-wasdal.bamboochain.id/api/v1";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", year.toString());

    try {
      const res = await fetch(`${API_URL}/data/upload/excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah file.");

      const data = await res.json();
      if (data.status === "success") {
        setMessage({ text: data.message, type: "success" });
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleSyncAPI = async () => {
    setIsSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/data/sync/sipd`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal sinkronisasi API.");
      const data = await res.json();
      if (data.status === "success") {
        setMessage({ text: data.message, type: "success" });
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="mb-8 border-b pb-4 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Ingestion Center</h1>
          <p className="text-gray-500 mt-2">Pusat sinkronisasi data RPJMD dan RKPD dari SIPD Kemendagri.</p>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Panel className="flex flex-col h-full">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <RefreshCw size={20} className="text-blue-500" /> API Auto-Sync
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tarik data secara otomatis menggunakan Web Service SIPD. Pastikan token API masih valid.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded border border-dashed border-gray-300 dark:border-gray-700">
             <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Recommended</Badge>
             <p className="text-sm text-gray-500 mb-6 text-center max-w-[200px]">Data realisasi dan target ditarik langsung ke database.</p>
             <Button variant="primary" onClick={handleSyncAPI} disabled={isSyncing}>
               {isSyncing ? <RefreshCw className="animate-spin mr-2" size={16} /> : <RefreshCw className="mr-2" size={16} />}
               {isSyncing ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}
             </Button>
          </div>
        </Panel>

        <Panel className="flex flex-col h-full">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText size={20} className="text-emerald-500" /> Manual Excel Upload
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Unggah laporan ekspor RKPD dari SIPD berformat Excel (.xlsx) jika koneksi API terputus.
            </p>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Tahun RKPD</label>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-transparent outline-none focus:border-emerald-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <input type="file" id="file-upload" className="hidden" accept=".xlsx,.xls" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Pilih File Excel</span>
                <span className="text-xs text-gray-500 mt-1">atau drag and drop di sini</span>
              </label>
            </div>

            {file && (
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border">
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                <Button variant="primary" onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Mengunggah..." : "Unggah & Proses"}
                </Button>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
