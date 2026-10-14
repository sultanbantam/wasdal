"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  FileText,
  Calendar,
  Send,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { getTalentSocialization, askTalentFAQ } from "@/lib/api";

export default function SocializationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FAQ state
  const [question, setQuestion] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqAnswer, setFaqAnswer] = useState<{
    answer: string;
    official_source: string;
    section_reference: string;
    disclaimer: string;
  } | null>(null);

  const loadData = () => {
    setLoading(true);
    getTalentSocialization()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setFaqLoading(true);
    setFaqAnswer(null);
    try {
      const res = await askTalentFAQ(question);
      setFaqAnswer(res);
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi layanan AI FAQ.");
    } finally {
      setFaqLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <GraduationCap className="text-indigo-600" size={26} /> Sosialisasi & Literasi Sistem Merit
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Materi regulasi resmi, jadwal webinar pembinaan, dan asisten AI FAQ berbasis regulasi kepegawaian negara.
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

      {/* AI FAQ Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <Sparkles size={18} /> Asisten AI FAQ Regulasi Manajemen Talenta
        </div>
        <p className="text-xs text-slate-500">
          Ajukan pertanyaan seputar 9-Box, IDP, suksesi, atau standar kompetensi. Jawaban ditarik dari dokumen resmi PermenPAN-RB No. 3/2020.
        </p>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder="Contoh: Bagaimana cara kerja kuadran 9-Box? atau Apa fungsi dokumen IDP?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={faqLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            {faqLoading ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
            Tanyakan
          </button>
        </form>

        {faqAnswer && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl space-y-2 text-xs">
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{faqAnswer.answer}</p>
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-indigo-900 dark:text-indigo-300">
              <span><strong>Sumber Resmi:</strong> {faqAnswer.official_source}</span>
              <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded font-mono text-[10px]">
                {faqAnswer.section_reference}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 italic pt-1">{faqAnswer.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Materials & Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materials */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-blue-600" size={16} /> Materi Regulasi & Panduan Praktis
          </h3>
          <div className="space-y-3">
            {data?.materials?.map((m: any) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {m.category}
                  </span>
                  <span className="text-[11px] text-slate-400">Dibaca {m.read_count}x</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{m.summary}</p>
                <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  Rujukan: {m.official_source_doc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events / Webinar */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-emerald-600" size={16} /> Agenda Pembinaan & Webinar Sosialisasi
          </h3>
          <div className="space-y-3">
            {data?.events?.map((e: any) => (
              <div
                key={e.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    {e.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(e.event_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{e.event_title}</h4>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div><strong>Narasumber:</strong> {e.speakers}</div>
                  <div><strong>Sasaran:</strong> {e.target_audience}</div>
                  <div><strong>Lokasi/Media:</strong> {e.location_or_link}</div>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>Peserta: {e.attendance_count} / {e.max_quota} Kuota</span>
                  <span className="text-emerald-600 font-semibold">Pendaftaran Dibuka</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
