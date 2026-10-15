"use client";

import { useEffect, useState } from "react";
import {
  UserCog,
  UserPlus,
  Mail,
  Building,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { getRegionDetail, getNetworkRegions } from "@/lib/api";
import { Badge, Button, Panel } from "@/components/ui";

export default function RegionalTeamPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staf Ahli Kepala Daerah");
  const [agency, setAgency] = useState("Sekretariat Daerah");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const regions = await getNetworkRegions();
      const tangsel = regions.find((r: any) => r.code?.includes("36.74")) || regions[0];
      if (tangsel) {
        const detail = await getRegionDetail(tangsel.id);
        setTeamMembers(detail?.team_members || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Harap isi nama dan email!");
      return;
    }
    const newMember = {
      id: "mem-" + Date.now(),
      user_name: name,
      user_email: email,
      role,
      agency,
      is_active: true,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setIsInviteOpen(false);
    setName("");
    setEmail("");
    setSuccessMsg(`Undangan keanggotaan untuk ${name} (${role}) berhasil dikirimkan.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Pengaturan Tim Staf Ahli & Kontributor Daerah</h2>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Role-Based Access
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun tim daerah: Staf Ahli Kepala Daerah, Admin Daerah, Kontributor OPD, dan Pimpinan Daerah.
          </p>
        </div>

        <Button
          onClick={() => setIsInviteOpen(!isInviteOpen)}
          className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5"
        >
          <UserPlus size={14} />
          <span>Tambah Anggota Tim</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Invite Form */}
      {isInviteOpen && (
        <Panel className="border-indigo-300 dark:border-indigo-800 shadow-lg">
          <h3 className="font-bold text-sm mb-3">Undang Anggota Tim Daerah Baru</h3>
          <form onSubmit={handleInvite} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="misal: Dr. Ir. H. Mulyadi, M.M."
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Email Resmi / Kedinasan</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="stafahli@tangselkota.go.id"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Peran / Hak Akses (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Staf Ahli Kepala Daerah">Staf Ahli Kepala Daerah</option>
                  <option value="Admin Daerah">Admin Daerah</option>
                  <option value="Kontributor OPD">Kontributor OPD</option>
                  <option value="Pimpinan Daerah">Pimpinan Daerah (Walikota/Bupati/Sekda)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Unit Kerja / OPD</label>
                <input
                  type="text"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Sekretariat Daerah / Bapenda / Bappeda"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                Kirim Undangan Akses
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {/* Team Members List */}
      <Panel>
        <h3 className="font-bold text-sm mb-3">Daftar Anggota Tim Daerah Terverifikasi</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {teamMembers.map((m) => (
            <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{m.user_name}</span>
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px]">
                    {m.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Mail size={12} />
                    {m.user_email}
                  </span>
                  <span>Unit: {m.agency || "Sekretariat Daerah"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Aktif</Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
