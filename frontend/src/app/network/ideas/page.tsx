"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb,
  PlusCircle,
  Sparkles,
  Share2,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { getNetworkIdeas, getNetworkRegions, createNetworkIdea, expressNetworkIdeaInterest } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function IdeasBankPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interestSuccessMsg, setInterestSuccessMsg] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [summaryPlain, setSummaryPlain] = useState("");
  const [noveltyElement, setNoveltyElement] = useState("");
  const [targetBeneficiaries, setTargetBeneficiaries] = useState("Pelaku UMKM dan Pemuda");
  const [category, setCategory] = useState("Aset & Ekonomi Kreatif");
  const [primaryOpd, setPrimaryOpd] = useState("");
  const [budgetMillion, setBudgetMillion] = useState<number>(200);
  const [fundingSource, setFundingSource] = useState("APBD / CSR BUMD");
  const [impactEffort, setImpactEffort] = useState("High Impact / Low Effort");

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
      }
      loadIdeas();
    } catch (err) {
      console.error(err);
    }
  };

  const loadIdeas = async () => {
    try {
      const items = await getNetworkIdeas();
      setIdeas(items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInterest = async (ideaId: string, ideaTitle: string) => {
    try {
      const res = await expressNetworkIdeaInterest(ideaId);
      setInterestSuccessMsg(`Minat mereplikasi "${ideaTitle}" berhasil dicatat (${res.interested_regions_count} daerah berminat)!`);
      loadIdeas();
      setTimeout(() => setInterestSuccessMsg(""), 5000);
    } catch (err: any) {
      alert("Gagal menyatakan minat: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summaryPlain || !primaryOpd) {
      alert("Harap lengkapi judul, uraian solusi, dan OPD utama!");
      return;
    }

    try {
      await createNetworkIdea({
        region_id: selectedRegionId,
        title,
        summary_plain: summaryPlain,
        novelty_element: noveltyElement || "Inovasi kolaboratif lintas sektor",
        target_beneficiaries: targetBeneficiaries,
        category,
        primary_opd: primaryOpd,
        estimated_budget_million: budgetMillion,
        funding_source_options: fundingSource,
        impact_vs_effort: impactEffort,
        is_replicable: true,
      });
      setIsModalOpen(false);
      resetForm();
      loadIdeas();
    } catch (err: any) {
      alert("Gagal menambahkan gagasan: " + err.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSummaryPlain("");
    setNoveltyElement("");
    setPrimaryOpd("");
    setBudgetMillion(200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Bank Gagasan & Inovasi Replikasi Daerah</h2>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300">
              Solusi Bersama
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Katalog inovasi kebijakan yang terbukti menyelesaikan masalah daerah dan siap diadopsi antarpemerintah daerah.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
        >
          <PlusCircle size={14} />
          <span>Tambah Gagasan Baru</span>
        </Button>
      </div>

      {interestSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{interestSuccessMsg}</span>
        </div>
      )}

      {/* Matriks Dampak vs Kemudahan Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={15} /> Kuadran Unggulan: High Impact / Low Effort
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Solusi yang memberikan dampak terasa langsung bagi warga dengan biaya dan hambatan birokrasi minimal (Quick Wins).
          </p>
        </Panel>

        <Panel className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <HeartHandshake size={15} /> Jaringan Replikasi Terbuka
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Klik tombol &ldquo;Saya Tertarik Mereplikasi&rdquo; untuk membuka ruang kerja sama antardaerah tanpa membuka data internal sensitif.
          </p>
        </Panel>
      </div>

      {/* Modal Input Gagasan */}
      {isModalOpen && (
        <Panel className="border-indigo-300 dark:border-indigo-800 shadow-lg">
          <h3 className="font-bold text-sm mb-3">Input Gagasan / Inovasi Kebijakan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nama / Judul Gagasan</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: Satu Aset Banyak Manfaat: Co-working UMKM di Fasilitas Idle"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Ringkasan Solusi dalam Bahasa Awam</label>
              <textarea
                rows={2}
                value={summaryPlain}
                onChange={(e) => setSummaryPlain(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Jelaskan bagaimana ide ini menyelesaikan masalah konkret masyarakat..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Unsur Kebaruan (Novelty)</label>
                <input
                  type="text"
                  value={noveltyElement}
                  onChange={(e) => setNoveltyElement(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Skema non-sewa berbasis point kebersihan & kolaborasi"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Penerima Manfaat Utama</label>
                <input
                  type="text"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Kategori Inovasi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Aset & Ekonomi Kreatif">Aset & Ekonomi Kreatif</option>
                  <option value="Fiskal & Transportasi">Fiskal & Transportasi</option>
                  <option value="Tata Ruang & Lingkungan">Tata Ruang & Lingkungan</option>
                  <option value="Digitalisasi Layanan">Digitalisasi Layanan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">OPD Penanggung Jawab Utama</label>
                <input
                  type="text"
                  value={primaryOpd}
                  onChange={(e) => setPrimaryOpd(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Diskop UKM & BPKAD"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Estimasi Kebutuhan Anggaran (Rp Juta)</label>
                <input
                  type="number"
                  value={budgetMillion}
                  onChange={(e) => setBudgetMillion(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Matriks Dampak vs Kemudahan</label>
                <select
                  value={impactEffort}
                  onChange={(e) => setImpactEffort(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="High Impact / Low Effort">High Impact / Low Effort (Sangat Prioritas)</option>
                  <option value="High Impact / High Effort">High Impact / High Effort (Strategis Jangka Panjang)</option>
                  <option value="Low Impact / Low Effort">Low Impact / Low Effort</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                Publikasikan ke Bank Gagasan
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {/* Ideas Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <Panel
            key={idea.id}
            className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {idea.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      {idea.readiness_status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {idea.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {idea.summary_plain}
              </p>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-700 dark:text-slate-300">
                  <strong>Unsur Kebaruan:</strong> {idea.novelty_element}
                </div>
                <div className="text-slate-500">
                  Lead OPD: <strong>{idea.primary_opd}</strong> • Estimasi Anggaran: Rp {idea.estimated_budget_million} Juta
                </div>
                <div className="text-slate-500">
                  Matriks: <span className="font-semibold text-indigo-600">{idea.impact_vs_effort}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                <strong>{idea.interested_regions_count}</strong> Daerah Berminat
              </span>

              <Button
                onClick={() => handleInterest(idea.id, idea.title)}
                className="text-xs h-7.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
              >
                <HeartHandshake size={14} />
                <span>Saya Tertarik Mereplikasi</span>
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
