"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  FileText,
  PlusCircle,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { getNetworkOverview, getNetworkRegions } from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

export default function NetworkHomePage() {
  const [activeTab, setActiveTab] = useState<"daerah" | "nasional">("daerah");
  const [overview, setOverview] = useState<any>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("wasdal_team_members");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setTeamMembers(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, regData] = await Promise.all([
        getNetworkOverview().catch(() => null),
        getNetworkRegions().catch(() => []),
      ]);
      setOverview(ovData);
      setRegions(regData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tangsel = regions.find((r) => r.code?.includes("36.74")) || regions[0];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-md">
        <div className="relative z-10 w-full max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-3">
            <Sparkles size={14} className="text-amber-300" />
            <span>Platform Kolaborasi Kebijakan Staf Ahli se-Indonesia</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-[26px] xl:text-[28px] font-extrabold tracking-tight whitespace-normal md:whitespace-nowrap">
            Satu Data, Banyak Gagasan, Solusi Bersama untuk Daerah
          </h2>
          <p className="mt-2 text-sm text-indigo-200 leading-relaxed">
            Menghubungkan Staf Ahli Gubernur, Bupati, dan Wali Kota se-Indonesia untuk menyusun diagnosis wilayah,
            mereplikasi gagasan inovatif, merumuskan transformasi fiskal pusat-daerah, serta mempercepat keputusan pimpinan.
          </p>

          {/* Quick Actions */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/network/issues">
              <Button variant="primary" className="bg-indigo-500 hover:bg-indigo-400 text-xs h-8">
                <PlusCircle size={14} /> Tambah Isu Strategis
              </Button>
            </Link>
            <Link href="/network/ideas">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 border border-white/20">
                <Lightbulb size={14} /> Tambah Gagasan
              </Button>
            </Link>
            <Link href="/network/profile">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 border border-white/20">
                <Building2 size={14} /> Perbarui Data Profil
              </Button>
            </Link>
            <Link href="/network/decisions">
              <Button variant="danger" className="bg-rose-600 hover:bg-rose-500 text-xs h-8">
                <AlertTriangle size={14} /> Ajukan Decision Required
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Role / View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("daerah")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "daerah"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Dashboard Staf Ahli Daerah ({tangsel?.name || "Tangsel"})
          </button>
          <button
            onClick={() => setActiveTab("nasional")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "nasional"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Dashboard Agregat Nasional
          </button>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition"
          title="Segarkan Data"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {activeTab === "daerah" ? (
        /* ============================================================ */
        /* TAB 1: DASHBOARD STAF AHLI DAERAH */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Panel className="border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
              <div className="text-xs font-medium text-slate-500">Kelengkapan Database Daerah</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {tangsel?.completion_score || 94}%
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300">
                  Terverifikasi
                </Badge>
              </div>
              <div className="mt-2">
                <ProgressBar value={tangsel?.completion_score || 94} tone="primary" />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Pembaruan: Hari ini</span>
                <Link href="/network/profile" className="text-indigo-600 font-medium hover:underline">
                  Lengkapi &rarr;
                </Link>
              </div>
            </Panel>

            <Panel>
              <div className="text-xs font-medium text-slate-500">Isu Strategis Aktif</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overview?.national_metrics?.total_strategic_issues || 1}
                </span>
                <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} /> 1 Prioritas Kritis
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Fokus isu: Kemandirian PBJT & Aset Publik Idle
              </p>
              <div className="mt-2">
                <Link href="/network/issues" className="text-xs text-indigo-600 font-medium hover:underline">
                  Buka Matriks Isu &rarr;
                </Link>
              </div>
            </Panel>

            <Panel>
              <div className="text-xs font-medium text-slate-500">Gagasan & Inovasi Daerah</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {overview?.national_metrics?.total_ideas || 2}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">1 Siap Replikasi</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                5 daerah menyatakan minat replikasi gagasan Tangsel
              </p>
              <div className="mt-2">
                <Link href="/network/ideas" className="text-xs text-indigo-600 font-medium hover:underline">
                  Kelola Gagasan &rarr;
                </Link>
              </div>
            </Panel>

            <Panel className="border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
              <div className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Clock size={13} /> Decision Required Menunggu
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-rose-700 dark:text-rose-300">
                  {overview?.national_metrics?.decisions_pending || 1}
                </span>
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300">
                  Pimpinan
                </Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                Perwal Pemanfaatan Bersama Aset Fasilitas Publik
              </p>
              <div className="mt-2">
                <Link href="/network/decisions" className="text-xs text-rose-600 font-semibold hover:underline">
                  Lihat Lembar Disposisi &rarr;
                </Link>
              </div>
            </Panel>
          </div>

          {/* Agenda & Quick Diagnosis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Isu Paling Mendesak & Diagnosis Ringkas */}
            <div className="lg:col-span-2 space-y-4">
              <Panel>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm">Isu Paling Mendesak & Lembar Diagnosis</h3>
                    <p className="text-xs text-slate-500">Hasil telaah Staf Ahli Bidang Perekonomian & Pembangunan</p>
                  </div>
                  <Link href="/network/diagnoses">
                    <Button variant="ghost" className="text-xs h-7 text-indigo-600">
                      Selengkapnya &rarr;
                    </Button>
                  </Link>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded">
                        Prioritas 91.5 / Kritis
                      </span>
                      <h4 className="font-bold text-sm mt-1.5">
                        Optimalisasi Kemandirian Fiskal & Harmonisasi PBJT Pasca Pemberlakuan UU HKPD
                      </h4>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                      Fiskal & APBD
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Akar Masalah:</strong> Realisasi PBJT perhotelan & kuliner terkendala disparitas digitalisasi kasir merchant menengah. Potensi kebocoran estimasi Rp 65-80 Miliar per tahun.
                  </p>

                  <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                    <strong>Rekomendasi Staf Ahli:</strong> Penerbitan Perwal Insentif Kepatuhan Wajib Pajak disertai integrasi cashback retribusi ke sistem loyalitas pejalan kaki.
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <span>PIC: Bapenda & Disperindag</span>
                    <Link href="/network/diagnoses" className="text-indigo-600 font-semibold hover:underline">
                      Buka Rincian 5W1H &rarr;
                    </Link>
                  </div>
                </div>
              </Panel>

              {/* 5 Gagasan Prioritas Replikasi */}
              <Panel>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm">Gagasan Prioritas Siap Direplikasi</h3>
                    <p className="text-xs text-slate-500">Inovasi taktis dengan matriks High Impact / Low Effort</p>
                  </div>
                  <Link href="/network/ideas">
                    <Button variant="ghost" className="text-xs h-7 text-indigo-600">
                      Buka Bank Gagasan &rarr;
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {(overview?.top_replicable_ideas || []).map((idea: any) => (
                    <div
                      key={idea.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs truncate">{idea.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                            {idea.readiness_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Kategori: {idea.category} • Matriks: {idea.impact_vs_effort}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
                          {idea.interested_count} Daerah Tertarik
                        </span>
                        <Link href="/network/ideas">
                          <Button variant="ghost" className="text-xs h-7 p-1 text-slate-400 hover:text-indigo-600">
                            <ArrowRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            {/* Right 1 Col: Agenda FGD & Kebutuhan Keputusan */}
            <div className="space-y-4">
              <Panel className="border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Users2 size={15} /> Agenda FGD Nasional
                </div>
                <h4 className="font-bold text-sm">
                  {overview?.latest_fgd?.theme || "Transformasi Fiskal Pusat dan Daerah"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Penyusunan usulan harmonisasi alokasi DAU earmarked dan optimalisasi BMD untuk diserahkan ke Kemenkeu & Kemendagri RI.
                </p>
                <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenggat Usulan:</span>
                    <span className="font-semibold text-indigo-600">3 Hari Lagi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Partisipasi Daerah:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {overview?.latest_fgd?.submissions_count || 29} / 38 Provinsi
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/network/fgd">
                    <Button variant="primary" className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-500">
                      Ikuti & Kirim Masukan FGD &rarr;
                    </Button>
                  </Link>
                </div>
              </Panel>

              {/* Status Tim Daerah */}
              <Panel>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Tim Staf Ahli Daerah Terdaftar
                  </h4>
                  {teamMembers.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {teamMembers.length} Personel
                    </span>
                  )}
                </div>

                {teamMembers.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {teamMembers.map((m: any, idx: number) => (
                      <div
                        key={m.id || idx}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{m.user_name || m.name}</div>
                          <div className="text-[11px] text-slate-500">{m.role || m.agency || "Staf Ahli"}</div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                          {m.status || "Aktif"}
                        </Badge>
                      </div>
                    ))}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link href="/network/team">
                        <Button variant="ghost" className="w-full text-xs h-7 text-slate-500 hover:text-indigo-600">
                          Kelola Anggota Tim &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <Users2 size={24} className="mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Belum Ada Tim Terdaftar</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                      Data anggota tim akan muncul otomatis di sini setelah diisi.
                    </p>
                    <Link href="/network/team">
                      <Button variant="secondary" className="text-xs h-7.5 px-3 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                        + Tambah Anggota Tim
                      </Button>
                    </Link>
                  </div>
                )}
              </Panel>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* TAB 2: DASHBOARD AGREGAT NASIONAL */
        /* ============================================================ */
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Panel className="text-center p-4">
              <div className="text-2xl font-extrabold text-indigo-600">{regions.length}</div>
              <div className="text-xs text-slate-500 mt-1">Daerah Terdaftar</div>
            </Panel>
            <Panel className="text-center p-4">
              <div className="text-2xl font-extrabold text-emerald-600">
                {overview?.national_metrics?.complete_profiles || 1}
              </div>
              <div className="text-xs text-slate-500 mt-1">Database Lengkap (&ge;80%)</div>
            </Panel>
            <Panel className="text-center p-4">
              <div className="text-2xl font-extrabold text-amber-600">
                {overview?.national_metrics?.total_strategic_issues || 1}
              </div>
              <div className="text-xs text-slate-500 mt-1">Isu Strategis Terdata</div>
            </Panel>
            <Panel className="text-center p-4">
              <div className="text-2xl font-extrabold text-purple-600">
                {overview?.national_metrics?.total_ideas || 2}
              </div>
              <div className="text-xs text-slate-500 mt-1">Gagasan Inovasi Berbagi</div>
            </Panel>
          </div>

          {/* Regional Table & Cards */}
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm">Peta Partisipasi Daerah Jejaring Nasional</h3>
                <p className="text-xs text-slate-500">Daftar daerah, status verifikasi database, dan kapasitas fiskal</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Kode & Daerah</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3">Provinsi</th>
                    <th className="p-3">Kepala Daerah</th>
                    <th className="p-3">Kelengkapan Data</th>
                    <th className="p-3">Status Verifikasi</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {regions.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-indigo-500 shrink-0" />
                          <span>{reg.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 ml-4.5">{reg.code}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">
                          {reg.region_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{reg.province_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{reg.leader_name || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <ProgressBar value={reg.completion_score} tone="primary" />
                          </div>
                          <span className="font-semibold text-[11px]">{reg.completion_score}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            reg.validation_status === "Terverifikasi Daerah"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300"
                          }
                        >
                          {reg.validation_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/network/profile`}>
                          <Button variant="ghost" className="text-xs h-7 text-indigo-600">
                            Buka Profil &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
