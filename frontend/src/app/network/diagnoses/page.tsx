"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  UserCheck,
} from "lucide-react";
import {
  getNetworkDiagnoses,
  getNetworkRegions,
  createNetworkDiagnosis,
  askNetworkAIAssist,
} from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function DiagnosesPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);

  // Form State
  const [problemStatement, setProblemStatement] = useState("");
  const [baselineCondition, setBaselineCondition] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [programGaps, setProgramGaps] = useState("");
  const [inactionRisks, setInactionRisks] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [expertRecommendation, setExpertRecommendation] = useState("");
  const [decisionPrompt, setDecisionPrompt] = useState("");

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
        loadDiagnoses(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDiagnoses = async (regionId: string) => {
    try {
      const items = await getNetworkDiagnoses(regionId);
      setDiagnoses(items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAI = async () => {
    setLoadingAI(true);
    setAiDraft(null);
    try {
      const res = await askNetworkAIAssist({
        action: "diagnose",
        region_id: selectedRegionId,
      });
      setAiDraft(res);
      if (res?.summary && !problemStatement) {
        setProblemStatement(res.summary);
      }
    } catch (err: any) {
      alert("Gagal memanggil Asisten AI: " + err.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement || !rootCause || !expertRecommendation) {
      alert("Harap lengkapi pernyataan masalah, akar masalah, dan rekomendasi staf ahli!");
      return;
    }

    try {
      await createNetworkDiagnosis({
        region_id: selectedRegionId,
        problem_statement: problemStatement,
        baseline_condition: baselineCondition || "Kondisi baseline terdokumentasi",
        root_cause: rootCause,
        program_gaps: programGaps || "Kesenjangan regulasi dan instrumen",
        inaction_risks: inactionRisks || "Potensi stagnasi capaian target",
        solution_options: [
          { code: "A", title: optionA || "Pilihan Solusi Taktis A" },
          { code: "B", title: optionB || "Pilihan Solusi Struktural B" },
        ],
        expert_recommendation: expertRecommendation,
        decision_prompt: decisionPrompt || "Kebutuhan penetapan kebijakan pimpinan daerah",
        author_name: "Staf Ahli Kepala Daerah",
      });
      setIsFormOpen(false);
      resetForm();
      loadDiagnoses(selectedRegionId);
    } catch (err: any) {
      alert("Gagal menyimpan diagnosis: " + err.message);
    }
  };

  const resetForm = () => {
    setProblemStatement("");
    setBaselineCondition("");
    setRootCause("");
    setProgramGaps("");
    setInactionRisks("");
    setOptionA("");
    setOptionB("");
    setExpertRecommendation("");
    setDecisionPrompt("");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Diagnosis Daerah & Solusi Taktis</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Formula 5W1H Staf Ahli
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format telaah mendalam: masalah utama, kelompok terdampak, akar penyebab, pilihan solusi A/B/C, dan rekomendasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleAskAI}
            disabled={loadingAI}
            className="text-xs h-8 bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5"
          >
            <Sparkles size={14} className={loadingAI ? "animate-spin" : ""} />
            <span>{loadingAI ? "Menganalisis..." : "Bantuan Asisten AI Staf Ahli"}</span>
          </Button>

          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            <span>{isFormOpen ? "Tutup Form" : "Buat Diagnosis Baru"}</span>
          </Button>
        </div>
      </div>

      {/* AI Assistant Output Card */}
      {aiDraft && (
        <Panel className="border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
              <Sparkles size={15} />
              <span>{aiDraft.title}</span>
            </div>
            <button onClick={() => setAiDraft(null)} className="text-xs text-slate-400 hover:text-slate-600">
              Tutup
            </button>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
            {aiDraft.summary}
          </p>
          <div className="mt-3 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Fakta Kunci Terdeteksi:</span>
            <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400">
              {aiDraft.evidence_facts?.map((f: string, idx: number) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-900 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            &bull; {aiDraft.guardrail_notice}
          </div>
        </Panel>
      )}

      {/* Input Form Modal / Accordion */}
      {isFormOpen && (
        <Panel className="border-indigo-300 dark:border-indigo-800 shadow-lg">
          <h3 className="font-bold text-sm mb-3">Lembar Telaah Diagnosis Staf Ahli Kepala Daerah</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">1. Pernyataan Masalah Utama (Problem Statement)</label>
              <textarea
                rows={2}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Apa masalah spesifik yang menghambat target pembangunan?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">2. Kondisi Awal / Baseline Data</label>
                <textarea
                  rows={2}
                  value={baselineCondition}
                  onChange={(e) => setBaselineCondition(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Data capaian saat ini dan kesenjangan angka..."
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">3. Akar Masalah (Root Cause)</label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Mengapa masalah ini terjadi berulang dan belum tuntas?"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">4. Kesenjangan Program / Regulasi (Gaps)</label>
                <textarea
                  rows={2}
                  value={programGaps}
                  onChange={(e) => setProgramGaps(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Program OPD apa yang belum mencukupi atau regulasi yang belum ada?"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">5. Risiko Jika Tidak Ditangani (Inaction Risks)</label>
                <textarea
                  rows={2}
                  value={inactionRisks}
                  onChange={(e) => setInactionRisks(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Potensi kerugian ekonomi, fiskal, atau layanan bagi masyarakat..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="font-semibold block mb-1">Pilihan Solusi Taktis (Opsi A)</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Intervensi digitalisasi sistem mandiri cepat (30 hari)"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Pilihan Solusi Struktural (Opsi B)</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Revisi regulasi Perda/Perwal & Kemitraan KSP jangka panjang"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Rekomendasi Staf Ahli kepada Pimpinan Daerah</label>
              <textarea
                rows={2}
                value={expertRecommendation}
                onChange={(e) => setExpertRecommendation(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Rekomendasi konkret, tidak normatif, dengan tahapan pelaksanaan terukur..."
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                Simpan Lembar Diagnosis
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {/* Diagnoses List */}
      <div className="space-y-4">
        {diagnoses.map((diag) => (
          <Panel key={diag.id} className="border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-sm">Telaah Staf Ahli: {diag.author_name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300">
                  {diag.status}
                </Badge>
                <span>{new Date(diag.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                  1. Masalah Utama:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {diag.problem_statement}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                    Akar Masalah (Root Cause):
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{diag.root_cause}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">
                    Risiko Pembiaran:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{diag.inaction_risks}</p>
                </div>
              </div>

              {diag.solution_options?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                    Pilihan Solusi:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {diag.solution_options.map((opt: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          Opsi {opt.code}: {opt.label || opt.title}
                        </div>
                        {opt.cost && <div className="text-[11px] text-slate-500">Estimasi Biaya: {opt.cost}</div>}
                        {opt.impact && <div className="text-[11px] text-emerald-600 font-medium">Dampak: {opt.impact}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
                <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase text-[10px] tracking-wider block mb-0.5">
                  Rekomendasi Staf Ahli:
                </span>
                <p className="text-indigo-950 dark:text-indigo-200 font-medium leading-relaxed">
                  {diag.expert_recommendation}
                </p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
