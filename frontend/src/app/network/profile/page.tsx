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
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  getNetworkRegions,
  getRegionDetail,
  updateRegionProfile,
  DEFAULT_TANGSEL_REGION,
} from "@/lib/api";
import { Badge, Button, Panel, ProgressBar } from "@/components/ui";

function calculateCompletionScore(data: any): number {
  if (!data) return 0;
  const fields = [
    "leader_name",
    "vice_leader_name",
    "sekda_name",
    "term_period",
    "capital_city",
    "website",
    "expert_staff_fields",
    "office_address",
    "total_area_km2",
    "population",
    "districts_count",
    "villages_count",
    "region_characters",
    "growth_center_zones",
    "dominant_disaster_risks",
    "economic_growth_rate",
    "pdrb_trillion",
    "poverty_rate",
    "unemployment_rate",
    "ipm",
    "total_umkm",
  ];
  let filled = 0;
  for (const f of fields) {
    const v = data[f];
    if (v !== undefined && v !== null && v !== "" && v !== 0) {
      filled++;
    }
  }
  return Math.round((filled / fields.length) * 100);
}

export default function RegionProfilePage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("reg-tangsel-demo");
  const [profileData, setProfileData] = useState<any>(DEFAULT_TANGSEL_REGION.profile);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Modal Tambah Wilayah Baru
  const [isAddRegionOpen, setIsAddRegionOpen] = useState<boolean>(false);
  const [newRegionName, setNewRegionName] = useState<string>("");
  const [newRegionType, setNewRegionType] = useState<string>("Kota");
  const [newRegionProvince, setNewRegionProvince] = useState<string>("");
  const [newRegionCode, setNewRegionCode] = useState<string>("");

  useEffect(() => {
    // Restore active profile from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("wasdal_profile_data_active");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Object.keys(parsed).length > 0) {
            setProfileData((prev: any) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {}
    }
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const list = await getNetworkRegions();
      if (list && list.length > 0) {
        setRegions(list);
        const tangsel = list.find((r: any) => r.code?.includes("36.74")) || list[0];
        if (tangsel) {
          setSelectedRegionId(tangsel.id);
          loadDetail(tangsel.id);
        }
      } else {
        setRegions([DEFAULT_TANGSEL_REGION]);
      }
    } catch (err) {
      console.error(err);
      setRegions([DEFAULT_TANGSEL_REGION]);
    }
  };

  const loadDetail = async (regionId: string) => {
    try {
      const data = await getRegionDetail(regionId);
      if (data?.profile) {
        let localEdits = null;
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(`wasdal_profile_data_${regionId}`);
            if (cached) localEdits = JSON.parse(cached);
          } catch (e) {}
        }
        setProfileData((prev: any) => ({
          ...prev,
          ...data.profile,
          ...(localEdits || {}),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => {
      const updated = { ...prev, [field]: value };
      if (typeof window !== "undefined") {
        try {
          const targetId = selectedRegionId || "reg-tangsel-demo";
          localStorage.setItem(`wasdal_profile_data_${targetId}`, JSON.stringify(updated));
          localStorage.setItem("wasdal_profile_data_active", JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg("");
    const targetRegionId = selectedRegionId || "reg-tangsel-demo";
    try {
      const res = await updateRegionProfile(targetRegionId, profileData);
      const score = res?.completion_score ?? calculateCompletionScore(profileData);
      setStatusMsg(`Profil Daerah berhasil disimpan! Kelengkapan data: ${score}%. Data tersimpan aman di database daerah.`);
      setProfileData((prev: any) => ({
        ...prev,
        completion_score: score,
        validation_status: score >= 80 ? "Terverifikasi Daerah" : "Draft Lengkap",
      }));
      setTimeout(() => setStatusMsg(""), 6000);
    } catch (err: any) {
      const score = calculateCompletionScore(profileData);
      setStatusMsg(`Profil disimpan secara lokal! Kelengkapan data: ${score}%.`);
      setTimeout(() => setStatusMsg(""), 6000);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName.trim()) {
      alert("Harap masukkan nama daerah!");
      return;
    }
    const newId = "reg-" + Date.now();
    const newEntry = {
      id: newId,
      code: newRegionCode.trim() || "00.00",
      name: newRegionName.trim(),
      province: newRegionProvince.trim() || "-",
      type: newRegionType,
      completion_score: 0,
      validation_status: "Draft",
    };
    const updatedRegions = [...regions, newEntry];
    setRegions(updatedRegions);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wasdal_registered_regions", JSON.stringify(updatedRegions));
      } catch (e) {}
    }
    setSelectedRegionId(newId);

    // Form kosong untuk wilayah baru yang didaftarkan
    const blankProfile = {
      leader_name: "",
      vice_leader_name: "",
      sekda_name: "",
      term_period: "",
      capital_city: "",
      website: "",
      expert_staff_fields: "",
      office_address: "",
      total_area_km2: "",
      population: "",
      districts_count: "",
      villages_count: "",
      region_characters: "",
      growth_center_zones: "",
      dominant_disaster_risks: "",
      economic_growth_rate: "",
      pdrb_trillion: "",
      poverty_rate: "",
      unemployment_rate: "",
      ipm: "",
      total_umkm: "",
      completion_score: 0,
      validation_status: "Draft Baru",
    };
    setProfileData(blankProfile);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`wasdal_profile_data_${newId}`, JSON.stringify(blankProfile));
        localStorage.setItem("wasdal_profile_data_active", JSON.stringify(blankProfile));
      } catch (e) {}
    }

    setIsAddRegionOpen(false);
    setNewRegionName("");
    setNewRegionProvince("");
    setNewRegionCode("");
    setActiveStep(1);
    setStatusMsg(`Profil wilayah "${newEntry.name}" berhasil dibuat! Silakan mulai isi formulir di bawah.`);
    setTimeout(() => setStatusMsg(""), 6000);
  };

  const handleDeleteCurrentRegion = () => {
    if (regions.length <= 1) {
      alert("Tidak dapat menghapus satu-satunya profil wilayah terdaftar.");
      return;
    }
    const currentName = regions.find((r) => r.id === selectedRegionId)?.name || "wilayah ini";
    if (confirm(`Apakah Anda yakin ingin menghapus profil ${currentName}?`)) {
      const remaining = regions.filter((r) => r.id !== selectedRegionId);
      setRegions(remaining);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wasdal_registered_regions", JSON.stringify(remaining));
          localStorage.removeItem(`wasdal_profile_data_${selectedRegionId}`);
        } catch (e) {}
      }
      setSelectedRegionId(remaining[0].id);
      loadDetail(remaining[0].id);
      setStatusMsg(`Profil ${currentName} berhasil dihapus.`);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const completionScore = profileData?.completion_score ?? calculateCompletionScore(profileData);

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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Region Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedRegionId}
              onChange={(e) => {
                if (e.target.value === "__NEW__") {
                  setIsAddRegionOpen(true);
                  return;
                }
                setSelectedRegionId(e.target.value);
                loadDetail(e.target.value);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="__NEW__">+ Daftarkan Daerah Baru...</option>
            </select>

            <Button
              variant="secondary"
              onClick={() => setIsAddRegionOpen(true)}
              className="text-xs h-8 flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 hover:bg-indigo-100 shadow-sm"
              title="Tambah Wilayah Baru"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Tambah Profil Wilayah</span>
            </Button>

            {regions.length > 1 && (
              <Button
                variant="ghost"
                onClick={handleDeleteCurrentRegion}
                className="text-xs h-8 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Hapus Wilayah Ini"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-sm text-white"
          >
            <Save size={14} />
            <span>{saving ? "Menyimpan..." : "Simpan Profil (Autosave)"}</span>
          </Button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      {/* Completion Indicator */}
      <Panel className="border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Indikator Kelengkapan Profil Wilayah: {completionScore}%
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            Status: {profileData?.validation_status || (completionScore >= 80 ? "Terverifikasi Daerah" : "Draft")}
          </span>
        </div>
        <ProgressBar value={completionScore} tone="primary" />
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Identitas Resmi Pemerintah Daerah
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Kepala Daerah (Gubernur/Bupati/Walikota)</label>
              <input
                type="text"
                value={profileData?.leader_name ?? ""}
                onChange={(e) => handleChange("leader_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="misal: Drs. H. Benyamin Davnie"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Wakil Kepala Daerah</label>
              <input
                type="text"
                value={profileData?.vice_leader_name ?? ""}
                onChange={(e) => handleChange("vice_leader_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="misal: H. Pilar Saga Ichsan, S.T., M.Arch"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Sekretaris Daerah (Sekda)</label>
              <input
                type="text"
                value={profileData?.sekda_name ?? ""}
                onChange={(e) => handleChange("sekda_name", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="misal: H. Bambang Noertjahjo, S.E., Ak."
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Periode Masa Jabatan</label>
              <input
                type="text"
                value={profileData?.term_period ?? ""}
                onChange={(e) => handleChange("term_period", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="misal: 2021-2026"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Ibu Kota / Pusat Pemerintahan</label>
              <input
                type="text"
                value={profileData?.capital_city ?? ""}
                onChange={(e) => handleChange("capital_city", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="misal: Ciputat / Setu"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Situs Web Resmi</label>
              <input
                type="text"
                value={profileData?.website ?? ""}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="https://tangselkota.go.id"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Bidang & Penugasan Staf Ahli</label>
              <input
                type="text"
                value={profileData?.expert_staff_fields ?? ""}
                onChange={(e) => handleChange("expert_staff_fields", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Bidang Perekonomian & Pembangunan; Bidang Pemerintahan; Bidang SDM & Kemasyarakatan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Alamat Kantor Pemerintahan</label>
              <textarea
                rows={2}
                value={profileData?.office_address ?? ""}
                onChange={(e) => handleChange("office_address", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Jl. Maruga No. 1, Serua, Kec. Ciputat..."
              />
            </div>
          </div>
        </Panel>
      )}

      {/* STEP 2: GAMBARAN WILAYAH */}
      {activeStep === 2 && (
        <Panel className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Demografi & Karakteristik Wilayah
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Luas Wilayah Total (km²)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.total_area_km2 !== undefined && profileData?.total_area_km2 !== null ? profileData.total_area_km2 : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("total_area_km2", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 147.19"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Penduduk (Jiwa)</label>
              <input
                type="number"
                step="1"
                value={profileData?.population !== undefined && profileData?.population !== null ? profileData.population : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("population", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 1378500"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Kecamatan</label>
              <input
                type="number"
                step="1"
                value={profileData?.districts_count !== undefined && profileData?.districts_count !== null ? profileData.districts_count : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("districts_count", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 7"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Kelurahan / Desa</label>
              <input
                type="number"
                step="1"
                value={profileData?.villages_count !== undefined && profileData?.villages_count !== null ? profileData.villages_count : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("villages_count", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 54"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Karakter Utama Wilayah</label>
              <input
                type="text"
                value={profileData?.region_characters ?? ""}
                onChange={(e) => handleChange("region_characters", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Perkotaan Modern, Pusat Jasa, Perdagangan, Pendidikan, Penyangga Megapolitan"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Pusat Pertumbuhan & Koridor Strategis</label>
              <input
                type="text"
                value={profileData?.growth_center_zones ?? ""}
                onChange={(e) => handleChange("growth_center_zones", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Koridor BSD City, Kawasan Bintaro Jaya, Segitiga Ciputat-Pamulang"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">Risiko Bencana Dominan</label>
              <input
                type="text"
                value={profileData?.dominant_disaster_risks ?? ""}
                onChange={(e) => handleChange("dominant_disaster_risks", e.target.value)}
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Genangan luapan drainase lokal, kemacetan perlintasan komuter"
              />
            </div>
          </div>
        </Panel>
      )}

      {/* STEP 3: SOSIAL & EKONOMI MAKRO */}
      {activeStep === 3 && (
        <Panel className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Indikator Makro Sosial & Ekonomi Daerah
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Laju Pertumbuhan Ekonomi (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.economic_growth_rate !== undefined && profileData?.economic_growth_rate !== null ? profileData.economic_growth_rate : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("economic_growth_rate", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 5.56"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">PDRB Konstan (Rp Triliun)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.pdrb_trillion !== undefined && profileData?.pdrb_trillion !== null ? profileData.pdrb_trillion : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("pdrb_trillion", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 76.71"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tingkat Kemiskinan (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.poverty_rate !== undefined && profileData?.poverty_rate !== null ? profileData.poverty_rate : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("poverty_rate", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 2.50"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Tingkat Pengangguran Terbuka (%)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.unemployment_rate !== undefined && profileData?.unemployment_rate !== null ? profileData.unemployment_rate : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("unemployment_rate", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 5.81"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Indeks Pembangunan Manusia (IPM)</label>
              <input
                type="number"
                step="0.01"
                value={profileData?.ipm !== undefined && profileData?.ipm !== null ? profileData.ipm : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("ipm", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 82.60"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Jumlah Unit UMKM Terdata</label>
              <input
                type="number"
                step="1"
                value={profileData?.total_umkm !== undefined && profileData?.total_umkm !== null ? profileData.total_umkm : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("total_umkm", val === "" ? "" : Number(val));
                }}
                placeholder="Contoh: 125000"
                className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </Panel>
      )}

      {/* Step Wizard Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          {activeStep > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              className="text-xs flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Kembali ke Langkah {activeStep - 1}
            </Button>
          ) : (
            <span className="text-xs text-slate-400">Langkah 1 dari 3: Identitas Pemerintahan</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeStep < 3 ? (
            <Button
              variant="primary"
              onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
            >
              <span>Lanjut ke Langkah {activeStep + 1}</span>
              <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 size={14} />
              <span>{saving ? "Menyimpan..." : "Simpan Seluruh Profil Data Daerah"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* MODAL: DAFTARKAN / TAMBAH WILAYAH BARU */}
      {isAddRegionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="text-indigo-600" size={20} />
                <h3 className="font-bold text-sm">Tambah Profil Wilayah Baru</h3>
              </div>
              <button
                onClick={() => setIsAddRegionOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Staf Ahli Kepala Daerah dapat mendaftarkan kabupaten/kota/provinsi baru di sini untuk mulai mengisi basis data profil wilayah.
            </p>

            <form onSubmit={handleCreateRegion} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Daerah Pemerintah *</label>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder="misal: Kabupaten Serang atau Kota Bandung"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Tingkat Wilayah</label>
                  <select
                    value={newRegionType}
                    onChange={(e) => setNewRegionType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Kota">Kota</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Provinsi *</label>
                  <input
                    type="text"
                    value={newRegionProvince}
                    onChange={(e) => setNewRegionProvince(e.target.value)}
                    placeholder="misal: Banten / Jawa Barat"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Kode Wilayah Kemendagri (Opsional)</label>
                <input
                  type="text"
                  value={newRegionCode}
                  onChange={(e) => setNewRegionCode(e.target.value)}
                  placeholder="misal: 36.04 atau 32.73"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsAddRegionOpen(false)} className="text-xs">
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Buat Profil & Buka Formulir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
