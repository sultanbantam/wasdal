"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  ShieldCheck,
} from "lucide-react";
import { getNetworkDecisions, getNetworkRegions, submitNetworkDisposition } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function DecisionsRequiredPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [decisions, setDecisions] = useState<any[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  // Disposition Modal State
  const [dispositionStatus, setDispositionStatus] = useState("Disetujui");
  const [selectedOption, setSelectedOption] = useState("Option A");
  const [dispositionNotes, setDispositionNotes] = useState("");
  const [dispositionBy, setDispositionBy] = useState("Wali Kota Tangerang Selatan");
  const [submitting, setSubmitting] = useState(false);

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
        loadDecisions(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDecisions = async (regionId: string) => {
    try {
      const list = await getNetworkDecisions(regionId);
      setDecisions(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openDispositionModal = (dec: any) => {
    setSelectedDecision(dec);
    setDispositionStatus(dec.status === "Menunggu Disposisi" ? "Disetujui" : dec.status);
    setSelectedOption(dec.selected_option || dec.options?.[0]?.code || "Option A");
    setDispositionNotes(dec.disposition_notes || "");
  };

  const handleDispositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecision) return;
    setSubmitting(true);
    try {
      await submitNetworkDisposition(selectedDecision.id, {
        status: dispositionStatus,
        selected_option: selectedOption,
        disposition_notes: dispositionNotes,
        disposition_by: dispositionBy,
      });
      setSelectedDecision(null);
      loadDecisions(selectedRegionId);
    } catch (err: any) {
      alert("Gagal memberikan disposisi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Pusat Keputusan Pimpinan Daerah (Decision Required)</h2>
            <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300">
              Disposisi Kepala Daerah / Sekda
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Urgensi keputusan kebijakan, perbandingan opsi solusi A/B/C, dan pencatatan disposisi resmi pimpinan.
          </p>
        </div>

        {regions.length > 1 && (
          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              loadDecisions(e.target.value);
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
      </div>

      {/* Decision Requests List */}
      <div className="space-y-4">
        {decisions.map((dec) => (
          <Panel
            key={dec.id}
            className={`border transition ${
              dec.status === "Menunggu Disposisi"
                ? "border-rose-300 dark:border-rose-900 shadow-sm"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      dec.status === "Menunggu Disposisi"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300"
                    }
                  >
                    {dec.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Ditujukan kepada: <strong>{dec.decision_owner}</strong>
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {dec.title}
                </h3>
              </div>

              <Button
                onClick={() => openDispositionModal(dec)}
                className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shrink-0"
              >
                <UserCheck size={14} />
                <span>Beri Disposisi Pimpinan</span>
              </Button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                  Masalah Singkat & Alasan Urgensi:
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {dec.issue_brief}
                </p>
                <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">
                  <strong>Urgensi Waktu:</strong> {dec.urgency_reason}
                </p>
              </div>

              {/* Options Comparison */}
              {dec.options?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                    Pilihan Keputusan bagi Pimpinan:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {dec.options.map((opt: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-[11px] space-y-1 ${
                          dec.selected_option === opt.code
                            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                        }`}
                      >
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          {opt.code}: {opt.title}
                        </div>
                        {opt.benefit && <div className="text-emerald-700 dark:text-emerald-400">Manfaat: {opt.benefit}</div>}
                        {opt.risk && <div className="text-rose-600 dark:text-rose-400">Risiko: {opt.risk}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase text-[10px] tracking-wider block mb-0.5">
                  Rekomendasi Staf Ahli:
                </span>
                <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  {dec.expert_recommendation}
                </p>
              </div>

              {dec.disposition_notes && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Disposisi Resmi ({dec.disposition_by}): {dec.status} (Pilihan: {dec.selected_option})</span>
                  </div>
                  <p className="text-xs leading-relaxed">{dec.disposition_notes}</p>
                </div>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {/* Disposition Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm">Lembar Penetapan Disposisi Pimpinan Daerah</h3>
              <button onClick={() => setSelectedDecision(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleDispositionSubmit} className="space-y-3">
              <div>
                <span className="text-slate-500 block mb-1">Judul Keputusan:</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedDecision.title}</div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Pejabat yang Memberikan Disposisi:</label>
                <input
                  type="text"
                  value={dispositionBy}
                  onChange={(e) => setDispositionBy(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Status Disposisi:</label>
                <select
                  value={dispositionStatus}
                  onChange={(e) => setDispositionStatus(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Disetujui">Disetujui</option>
                  <option value="Diberi Catatan">Diberi Catatan / Perbaikan</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Pilihan Solusi yang Ditetapkan:</label>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {selectedDecision.options?.map((opt: any, idx: number) => (
                    <option key={idx} value={opt.code}>
                      {opt.code}: {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan Arahan Pimpinan:</label>
                <textarea
                  rows={3}
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Instruksi tindak lanjut kepada Sekda / OPD terkait..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setSelectedDecision(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500">
                  {submitting ? "Menyimpan..." : "Tetapkan Disposisi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
