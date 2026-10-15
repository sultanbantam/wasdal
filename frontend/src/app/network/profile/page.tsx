"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Save,
  CheckCircle2,
  Users,
  Compass,
  TrendingUp,
  MapPin,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { getNetworkRegions, getRegionDetail, updateRegionProfile } from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

export default function RegionProfilePage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [profileData, setProfileData] = useState<any>({});
  const [activeStep, setActiveStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

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
        loadDetail(tangsel.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDetail = async (regionId: string) => {
    try {
      const data = await getRegionDetail(regionId);
      if (data?.profile) {
        setProfileData(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedRegionId) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await updateRegionProfile(selectedRegionId, profileData);
      setStatusMsg(`Berhasil disimpan! Skor kelengkapan database: ${res.completion_score}%.`);
      setProfileData((prev: any) => ({ ...prev, completion_score: res.completion_score }));
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err: any) {
      alert("Gagal menyimpan profil: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Profil Wilayah & Data Dasar Daerah</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Wizard Bertahap
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas pemerintahan, demografi, dan capaian makro sosial-ekonomi resmi daerah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {regions.length > 1 && (
            <select
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value);
                loadDetail(e.target.value);
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

          <Button
            onClick={handleSave}
            disabled={saving}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>{saving ? "Menyimpan..." : "Simpan Profil (Autosave)"}</span>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Completion Indicator */}
      <Panel className="border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Indikator Kelengkapan Profil Wilayah: {profileData?.completion_score || 0}%
          </span>
          <span className="text-indigo-600 font-semibold">
            Status: {profileData?.validation_status || "Draft"}
          </span>
        </div>
        <ProgressBar value={profileData?.completion_score || 0} tone="primary" />
      </Panel>

      {/* Step Wizard Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeStep === 1
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 size={15} />
          <span>1. Identitas Pemerintahan</span>
        </button>
        <button
          onClick={() => setActiveStep(2)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeStep === 2
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Compass size={15} />
          <span>2. Gambaran Wilayah & Demografi</span>
        </button>
        <button
          onClick={() => setActiveStep(3)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeStep === 3
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <TrendingUp size={15} />
          <span>3. Sosial & Ekonomi Makro</span>
        </button>
      </div>

      {/* STEP 1: IDENTITAS PEMERINTAHAN */}
      {activeStep === 1 && (
        <Panel className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Kepala Daerah (Gubernur/Bupati/Walikota)</label>
              <input
                type="text"
                value={profileData.leader_name || ""}
                onChange={(e) => handleChange("leader_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: Drs. H. Benyamin Davnie"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Wakil Kepala Daerah</label>
              <input
                type="text"
                value={profileData.vice_leader_name || ""}
                onChange={(e) => handleChange("vice_leader_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: H. Pilar Saga Ichsan, S.T., M.Arch"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Sekretaris Daerah (Sekda)</label>
              <input
                type="text"
                value={profileData.sekda_name || ""}
                onChange={(e) => handleChange("sekda_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: H. Bambang Noertjahjo, S.E., Ak."
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Periode Masa Jabatan</label>
              <input
                type="text"
                value={profileData.term_period || ""}
                onChange={(e) => handleChange("term_period", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: 2021-2026"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Ibu Kota / Pusat Pemerintahan</label>
              <input
                type="text"
                value={profileData.capital_city || ""}
                onChange={(e) => handleChange("capital_city", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="misal: Ciputat / Setu"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Situs Web Resmi</label>
              <input
                type="text"
                value={profileData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="https://tangselkota.go.id"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Bidang & Penugasan Staf Ahli</label>
              <input
                type="text"
                value={profileData.expert_staff_fields || ""}
                onChange={(e) => handleChange("expert_staff_fields", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Bidang Perekonomian & Pembangunan; Bidang Pemerintahan; Bidang SDM & Kemasyarakatan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Alamat Kantor Pemerintahan</label>
              <textarea
                rows={2}
                value={profileData.office_address || ""}
                onChange={(e) => handleChange("office_address", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Jl. Maruga No. 1, Serua, Kec. Ciputat..."
              />
            </div>
          </div>
        </Panel>
      )}

      {/* STEP 2: GAMBARAN WILAYAH */}
      {activeStep === 2 && (
        <Panel className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Luas Wilayah Total (km²)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.total_area_km2 || 0}
                onChange={(e) => handleChange("total_area_km2", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Penduduk (Jiwa)</label>
              <input
                type="number"
                value={profileData.population || 0}
                onChange={(e) => handleChange("population", parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Kecamatan</label>
              <input
                type="number"
                value={profileData.districts_count || 0}
                onChange={(e) => handleChange("districts_count", parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Kelurahan / Desa</label>
              <input
                type="number"
                value={profileData.villages_count || 0}
                onChange={(e) => handleChange("villages_count", parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Karakter Utama Wilayah</label>
              <input
                type="text"
                value={profileData.region_characters || ""}
                onChange={(e) => handleChange("region_characters", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Perkotaan Modern, Pusat Jasa, Perdagangan, Pendidikan, Penyangga Megapolitan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Pusat Pertumbuhan & Koridor Strategis</label>
              <input
                type="text"
                value={profileData.growth_center_zones || ""}
                onChange={(e) => handleChange("growth_center_zones", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Koridor BSD City, Kawasan Bintaro Jaya, Segitiga Ciputat-Pamulang"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Risiko Bencana Dominan</label>
              <input
                type="text"
                value={profileData.dominant_disaster_risks || ""}
                onChange={(e) => handleChange("dominant_disaster_risks", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Genangan luapan drainase lokal, kemacetan perlintasan komuter"
              />
            </div>
          </div>
        </Panel>
      )}

      {/* STEP 3: SOSIAL & EKONOMI MAKRO */}
      {activeStep === 3 && (
        <Panel className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Laju Pertumbuhan Ekonomi (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.economic_growth_rate || 0}
                onChange={(e) => handleChange("economic_growth_rate", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">PDRB Konstan (Rp Triliun)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.pdrb_trillion || 0}
                onChange={(e) => handleChange("pdrb_trillion", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tingkat Kemiskinan (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.poverty_rate || 0}
                onChange={(e) => handleChange("poverty_rate", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tingkat Pengangguran Terbuka (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.unemployment_rate || 0}
                onChange={(e) => handleChange("unemployment_rate", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Indeks Pembangunan Manusia (IPM)</label>
              <input
                type="number"
                step="0.01"
                value={profileData.ipm || 0}
                onChange={(e) => handleChange("ipm", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Unit UMKM Terdata</label>
              <input
                type="number"
                value={profileData.total_umkm || 0}
                onChange={(e) => handleChange("total_umkm", parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
