"use client";

import { useEffect, useState } from "react";
import { getDecisionsRequired, type DecisionRequired } from "@/lib/executiveApi";
import { AlertCircle, Clock, Users, ArrowRight } from "lucide-react";

export default function DecisionRequiredPage() {
  const [decisions, setDecisions] = useState<DecisionRequired[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDecisionsRequired()
      .then(setDecisions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading Decision Required...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Decision Required</h1>
        <p className="text-gray-500 mt-2">Keputusan eksekutif yang membutuhkan persetujuan segera.</p>
      </header>

      <div className="space-y-6">
        {decisions.map((decision, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  decision.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {decision.priority}
                </span>
                <h2 className="text-xl font-bold mt-2 text-gray-900 dark:text-white">{decision.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500 block">Owner</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{decision.decision_owner}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-gray-400" />
                <div>
                  <span className="block font-medium text-gray-900 dark:text-white">Dampak</span>
                  {decision.impact}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-gray-400" />
                <div>
                  <span className="block font-medium text-gray-900 dark:text-white">OPD Terkait</span>
                  {decision.responsible_opd}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Opsi Resolusi (AI Recommendation)</h3>
              <div className="space-y-3">
                {decision.options.map((opt) => (
                  <div key={opt.id} className={`p-3 rounded border ${opt.id === decision.recommended_option ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 bg-white dark:bg-gray-800'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${opt.id === decision.recommended_option ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>Opsi {opt.id}</span>
                        {opt.id === decision.recommended_option && <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Recommended</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" /> {opt.estimated_time}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{opt.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm">
                Minta Data Tambahan
              </button>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium text-sm">
                Review & Approve <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
