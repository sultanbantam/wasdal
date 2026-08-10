"use client";

import { useEffect, useState } from "react";
import { getPerformanceSummary, type PerformanceSummary } from "@/lib/executiveApi";
import { Shield, TrendingUp, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";

export default function MayorDashboard() {
  const [data, setData] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformanceSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading Executive Dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </a>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kinerja Pembangunan Kota</h1>
            <p className="text-gray-500">Executive Dashboard - Walikota</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Capaian RPJMD
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.rpjmd_achievement}%</div>
          <div className="mt-2 text-sm text-green-600 bg-green-50 inline-block px-2 py-1 rounded">On Track</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Capaian RKPD
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.rkpd_achievement}%</div>
          <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 inline-block px-2 py-1 rounded">Need Attention</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Realisasi Keuangan
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.financial_realization}%</div>
          <div className="mt-2 text-sm text-red-600 bg-red-50 inline-block px-2 py-1 rounded">At Risk</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
          <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Realisasi Fisik
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.physical_realization}%</div>
          <div className="mt-2 text-sm text-red-600 bg-red-50 inline-block px-2 py-1 rounded">At Risk</div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm mt-8">
        <h2 className="text-lg font-semibold mb-4">Status Indikator Program</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col items-center justify-center">
            <span className="text-green-600 font-bold text-2xl">{data.status_distribution.GREEN}</span>
            <span className="text-xs text-green-700 uppercase font-semibold">On Track</span>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center">
            <span className="text-yellow-600 font-bold text-2xl">{data.status_distribution.YELLOW}</span>
            <span className="text-xs text-yellow-700 uppercase font-semibold">Need Attention</span>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center justify-center">
            <span className="text-orange-500 font-bold text-2xl">{data.status_distribution.ORANGE}</span>
            <span className="text-xs text-orange-600 uppercase font-semibold">At Risk</span>
          </div>
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center">
            <span className="text-red-600 font-bold text-2xl">{data.status_distribution.RED}</span>
            <span className="text-xs text-red-700 uppercase font-semibold">Critical</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-gray-600 font-bold text-2xl">{data.status_distribution.GREY}</span>
            <span className="text-xs text-gray-700 uppercase font-semibold">Data N/A</span>
          </div>
        </div>
      </div>

    </div>
  );
}
