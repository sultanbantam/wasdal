"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  TrendingUp,
  PieChart,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  FileText,
  Calculator,
} from "lucide-react";
import { getNetworkFiscal, getNetworkRegions } from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

export default function FiscalDiagnosisPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [fiscalData, setFiscalData] = useState<any>(null);

  // Simulation Sliders
  const [padDeltaPct, setPadDeltaPct] = useState<number>(0); // -20% to +20%
  const [transferDeltaPct, setTransferDeltaPct] = useState<number>(0);

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
        loadFiscal(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFiscal = async (regionId: string) => {
    try {
      const res = await getNetworkFiscal(regionId);
      setFiscalData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const snap = fiscalData?.snapshots?.[0];
  const roadmap = fiscalData?.roadmap;

  // Simulasi Dinamis
  const basePad = snap?.pad_billion || 2280;
  const baseTransfer = snap?.transfer_revenue_billion || 2010;
  const simPad = basePad * (1 + padDeltaPct / 100);
  const simTransfer = baseTransfer * (1 + transferDeltaPct / 100);
  const simTotalRev = simPad + simTransfer + (snap?.other_legal_revenue_billion || 130);
  const simPadRatio = simTotalRev > 0 ? (simPad / simTotalRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Diagnosis Fiskal, APBD & Peta Jalan Transformasi</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Analisis Kemandirian
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Potret struktur pendapatan, belanja modal, kemandirian PAD, dan simulasi skenario ruang fiskal daerah.
          </p>
        </div>

        {regions.length > 1 && (
          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              loadFiscal(e.target.value);
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

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Panel className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900">
          <div className="text-xs font-medium text-slate-500">Rasio Kemandirian PAD</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {snap?.pad_ratio_pct?.toFixed(1) || 51.6}%
            </span>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
              Mandiri
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Realisasi PAD: Rp {snap?.pad_billion?.toLocaleString("id-ID") || "2.280"} Miliar
          </p>
        </Panel>

        <Panel>
          <div className="text-xs font-medium text-slate-500">Ketergantungan Transfer (TKD)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {snap?.transfer_dependency_pct?.toFixed(1) || 45.5}%
            </span>
            <span className="text-xs text-amber-500 font-semibold">Terkendali</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Transfer Pusat: Rp {snap?.transfer_revenue_billion?.toLocaleString("id-ID") || "2.010"} Miliar
          </p>
        </Panel>

        <Panel>
          <div className="text-xs font-medium text-slate-500">Porsi Belanja Modal Infrastruktur</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {snap?.capital_ratio_pct?.toFixed(1) || 22.4}%
            </span>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Di Atas Rata-rata
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Belanja Modal: Rp {snap?.capital_expenditure_billion?.toLocaleString("id-ID") || "1.020"} Miliar
          </p>
        </Panel>

        <Panel>
          <div className="text-xs font-medium text-slate-500">Kapasitas Ruang Fiskal Daerah</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {snap?.fiscal_space_level || "Sedang"}
            </span>
            <span className="text-xs text-slate-500">SILPA: Rp {snap?.silpa_billion || 260} M</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Belanja Pegawai terkendali di {snap?.personnel_ratio_pct?.toFixed(1) || 30.5}%
          </p>
        </Panel>
      </div>

      {/* Simulator Ruang Fiskal & Sensitivitas */}
      <Panel className="border-indigo-100 dark:border-indigo-900 bg-slate-50/50 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <Calculator size={18} className="text-indigo-600" />
          <h3 className="font-bold text-sm">Simulasi Sensitivitas Ruang Fiskal Interaktif</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Geser persentase untuk menyimulasikan dampak fluktuasi PAD dan Transfer Daerah terhadap proporsi kemandirian fiskal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-semibold">
              <span>Skenario PAD (Pajak & Retribusi):</span>
              <span className={padDeltaPct >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {padDeltaPct > 0 ? `+${padDeltaPct}%` : `${padDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="5"
              value={padDeltaPct}
              onChange={(e) => setPadDeltaPct(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>-20% (Kontraksi)</span>
              <span>Baseline (0%)</span>
              <span>+20% (Optimalisasi)</span>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between font-semibold">
              <span>Skenario Transfer Pusat (DAU/DBH):</span>
              <span className={transferDeltaPct >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {transferDeltaPct > 0 ? `+${transferDeltaPct}%` : `${transferDeltaPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="5"
              value={transferDeltaPct}
              onChange={(e) => setTransferDeltaPct(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>-20% (Pengetatan)</span>
              <span>Baseline (0%)</span>
              <span>+20% (Ekspansi)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-600 dark:text-slate-400">Hasil Proyeksi Total Pendapatan:</span>
            <span className="ml-2 font-extrabold text-slate-900 dark:text-white text-sm">
              Rp {Math.round(simTotalRev).toLocaleString("id-ID")} Miliar
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Proyeksi Kemandirian PAD:</span>
            <span className="ml-2 font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {simPadRatio.toFixed(1)}%
            </span>
          </div>
        </div>
      </Panel>

      {/* Peta Jalan Transformasi Fiskal */}
      {roadmap && (
        <Panel>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-bold text-sm">{roadmap.title}</h3>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px]">
              Target: {roadmap.target_year}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                1. Program Efisiensi Belanja:
              </span>
              <p className="text-slate-700 dark:text-slate-300">{roadmap.efficiency_programs}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                2. Strategi Optimalisasi PAD:
              </span>
              <p className="text-slate-700 dark:text-slate-300">{roadmap.pad_optimization_strategy}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                3. Pemanfaatan & Optimalisasi Aset:
              </span>
              <p className="text-slate-700 dark:text-slate-300">{roadmap.asset_optimization_strategy}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                4. Kebutuhan Dukungan Pemerintah Pusat (Kemenkeu/Kemendagri):
              </span>
              <p className="text-slate-700 dark:text-slate-300">{roadmap.central_support_needs}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Lead Agency: {roadmap.lead_agency}</span>
            <span className="font-semibold text-indigo-600">Status: {roadmap.status}</span>
          </div>
        </Panel>
      )}

      {/* Official Disclaimer */}
      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-[11px] leading-relaxed flex items-center gap-2">
        <ShieldAlert size={15} className="shrink-0 text-slate-400" />
        <span>
          {fiscalData?.disclaimer ||
            "Analisis fiskal merupakan alat bantu diagnosis staf ahli dan wajib diverifikasi oleh BPKAD sesuai ketentuan regulasi perundang-undangan."}
        </span>
      </div>
    </div>
  );
}
