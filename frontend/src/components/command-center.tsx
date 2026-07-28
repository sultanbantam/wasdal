"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Filter,
  Gauge,
  Layers,
  ListChecks,
  MapPinned,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UsersRound,
  Mic,
  Square,
  Upload
} from "lucide-react";
import { getCases, getDashboard, runIntake, runMeeting, getMeetings } from "@/lib/api";
import { formatNumber, priorityTone } from "@/lib/utils";
import type { CaseItem, DashboardData, IntakeResult, MeetingResult } from "@/types/wasdal";
import { Badge, Button, Panel, ProgressBar, SectionTitle } from "@/components/ui";

const TacticalMap = dynamic(() => import("@/components/tactical-map").then((mod) => mod.TacticalMap), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-lg border border-border bg-muted" />
});

type ModuleKey = "dashboard" | "cases" | "intake" | "meeting" | "archive" | "knowledge";

const modules: Array<{ key: ModuleKey; label: string; icon: typeof Gauge }> = [
  { key: "dashboard", label: "Command Center", icon: Gauge },
  { key: "cases", label: "Case Board", icon: ClipboardList },
  { key: "intake", label: "AI Intake", icon: Sparkles },
  { key: "meeting", label: "Meeting Mode", icon: UsersRound },
  { key: "archive", label: "Meeting Archive", icon: FileText },
  { key: "knowledge", label: "Knowledge", icon: Layers }
];

export function CommandCenter() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [dark, setDark] = useState(false);
  const dashboardQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const casesQuery = useQuery({ queryKey: ["cases"], queryFn: getCases });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const dashboard = dashboardQuery.data;
  const cases = casesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">Wasdal</h1>
              <p className="truncate text-xs text-muted-foreground">Copilot untuk Bagian Ekbang</p>
            </div>
          </div>
          <div className="hidden max-w-xl flex-1 items-center rounded-md border border-border bg-white px-3 py-2 dark:bg-[#111827] md:flex">
            <Search size={16} className="text-muted-foreground" />
            <input className="ml-2 w-full bg-transparent text-sm outline-none" placeholder="Cari kasus, OPD, lokasi, atau keputusan" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-9 w-9 px-0" title="Notifikasi">
              <BellRing size={17} />
            </Button>
            <Button variant="ghost" className="h-9 w-9 px-0" title="Tema" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button variant="primary" onClick={() => setActive("intake")}>
              <Plus size={16} />
              Intake
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-border p-4 lg:block">
          <nav className="space-y-1">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    active === item.key ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <Panel className="mt-6">
            <SectionTitle title="AI Guardrails" meta="Rekomendasi tidak menutup kasus" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                Human approval
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                Confidence score
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                Audit trail
              </div>
            </div>
          </Panel>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
            {modules.map((item) => (
              <Button key={item.key} variant={active === item.key ? "primary" : "ghost"} onClick={() => setActive(item.key)}>
                <item.icon size={16} />
                {item.label}
              </Button>
            ))}
          </div>
          {active === "dashboard" && dashboard ? <DashboardView dashboard={dashboard} cases={cases} /> : null}
          {active === "cases" ? <CasesView cases={cases} /> : null}
          {active === "intake" ? <IntakeView /> : null}
          {active === "meeting" ? <MeetingView cases={cases} /> : null}
          {active === "archive" ? <MeetingArchiveView /> : null}
          {active === "knowledge" ? <KnowledgeView /> : null}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ dashboard, cases }: { dashboard: DashboardData; cases: CaseItem[] }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel className="flex flex-col">
          <SectionTitle title="Peta Kasus" meta="Sebaran lokasi dan tingkat prioritas">
            <Button variant="ghost">
              <Filter size={16} />
              Filter
            </Button>
          </SectionTitle>
          <div className="flex-1">
            <TacticalMap points={dashboard.map_points} />
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Copilot Ekbang" meta="Brief untuk rapat dan eskalasi" />
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-6">{dashboard.executive_brief}</div>
          <div className="mt-4 space-y-3">
            {dashboard.ai_watchlist.map((item) => (
              <div key={String(item.number)} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{String(item.number)}</span>
                  <Badge className={priorityTone(String(item.priority))}>{String(item.priority)}</Badge>
                </div>
                <div className="mt-2 text-sm font-medium">{String(item.title)}</div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(item.risk)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <SectionTitle title="Analitik Kasus" meta="Status, kategori, dan prioritas" />
          <DistributionBars data={dashboard.cases_by_status} tone="primary" />
          <div className="mt-5">
            <DistributionBars data={dashboard.cases_by_category} tone="secondary" compact />
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Daftar Prioritas" meta="Urutan risiko tertinggi" />
          <CaseTable cases={cases.slice(0, 5)} />
        </Panel>
      </div>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: DashboardData["metrics"] }) {
  const toneClass = {
    neutral: "text-secondary",
    warning: "text-warning",
    danger: "text-danger",
    success: "text-success"
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => (
        <Panel key={metric.label} className="min-h-[116px]">
          <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-3xl font-semibold">{formatNumber(metric.value)}</div>
            <BarChart3 size={22} className={toneClass[metric.tone]} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{metric.delta}</p>
        </Panel>
      ))}
    </div>
  );
}

function DistributionBars({ data, tone, compact = false }: { data: Record<string, number>; tone: "primary" | "secondary"; compact?: boolean }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className={compact ? "grid gap-2 sm:grid-cols-2" : "space-y-3"}>
      {Object.entries(data).map(([label, value]) => (
        <div key={label} className="min-w-0">
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
          <ProgressBar value={(value / max) * 100} tone={tone} />
        </div>
      ))}
    </div>
  );
}

function CaseTable({ cases }: { cases: CaseItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="border-b border-border py-2 font-medium">Nomor</th>
            <th className="border-b border-border py-2 font-medium">Kasus</th>
            <th className="border-b border-border py-2 font-medium">Prioritas</th>
            <th className="border-b border-border py-2 font-medium">PIC</th>
            <th className="border-b border-border py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id}>
              <td className="border-b border-border py-3 text-xs font-medium text-muted-foreground">{item.number}</td>
              <td className="border-b border-border py-3 pr-4">
                <div className="max-w-[320px] truncate font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.category} - {item.location_name}</div>
              </td>
              <td className="border-b border-border py-3">
                <Badge className={priorityTone(item.priority)}>{item.priority}</Badge>
              </td>
              <td className="border-b border-border py-3 text-muted-foreground">{item.pic ?? "Belum ditetapkan"}</td>
              <td className="border-b border-border py-3">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CasesView({ cases }: { cases: CaseItem[] }) {
  const columns = ["New", "Assigned", "In Progress", "Waiting Decision", "Resolved"];
  const grouped = useMemo(
    () =>
      columns.map((status) => ({
        status,
        items: cases.filter((item) => item.status === status)
      })),
    [cases]
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Case Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Assignment, SLA, komentar, dan audit trail dalam satu alur.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">
            <CalendarClock size={16} />
            Calendar
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById("action-plan")?.scrollIntoView({ behavior: "smooth" })}>
            <ListChecks size={16} />
            Action Plan
          </Button>
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-5">
        {grouped.map((column) => (
          <section key={column.status} className="min-h-[420px] rounded-lg border border-border bg-white p-3 dark:bg-[#111827]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{column.status}</h3>
              <Badge className="border-border bg-muted text-muted-foreground">{column.items.length}</Badge>
            </div>
            <div className="space-y-3">
              {column.items.map((item) => (
                <article key={item.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{item.number}</span>
                    <Badge className={priorityTone(item.priority)}>{item.priority}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold leading-5">{item.title}</h4>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.ai_summary}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-muted-foreground">{item.agency}</span>
                    <span className="font-medium">{item.priority_score}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Panel id="action-plan">
        <SectionTitle title="Action Plan" meta="Monitoring tindak lanjut" />
        <CaseTable cases={cases} />
      </Panel>
    </div>
  );
}

function IntakeView() {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState("");
  const [createCase, setCreateCase] = useState(true);
  const intakeMutation = useMutation<IntakeResult, Error, string>({
    mutationFn: (text) => runIntake(text, createCase),
    onSuccess: () => {
      setRawText("");
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const result = intakeMutation.data;
  return (
    <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
      <Panel>
        <SectionTitle title="AI Intake" meta="Antrean laporan masuk" />
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          className="min-h-[260px] w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={createCase} onChange={(event) => setCreateCase(event.target.checked)} />
            Buat case dari hasil AI
          </label>
          <Button disabled={intakeMutation.isPending} onClick={() => intakeMutation.mutate(rawText)}>
            <Send size={16} />
            Proses Intake
          </Button>
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Hasil Struktur AI" meta="Rekomendasi wajib diverifikasi manusia">
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            {result ? `${Math.round(result.confidence * 100)}% confidence` : "Ready"}
          </Badge>
        </SectionTitle>
        {result ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className={priorityTone(result.priority)}>{result.priority}</Badge>
                <Badge className="border-secondary/20 bg-secondary/10 text-secondary">{result.category}</Badge>
                <Badge className="border-border bg-muted text-muted-foreground">{result.suggested_agency}</Badge>
              </div>
              <p className="text-sm leading-6">{result.summary}</p>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span>Skor: {result.priority_score}</span>
                <span>Lokasi: {result.location_name}</span>
                <span>Deadline: {result.suggested_deadline ?? "Perlu ditetapkan"}</span>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {result.recommendations.map((item) => (
                <div key={String(item.horizon)} className="rounded-md border border-border p-3">
                  <div className="text-sm font-semibold">{String(item.horizon)}</div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{String(item.action)}</p>
                  <div className="mt-3 text-xs font-medium">{String(item.estimated_time)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {result.audit_notes.map((note) => (
                <div key={note} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 size={14} className="text-success" />
                  {note}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            <Bot size={18} className="mr-2 text-primary" />
            Menunggu intake
          </div>
        )}
      </Panel>
    </div>
  );
}

function MeetingView({ cases }: { cases: CaseItem[] }) {
  const priorityCases = cases.filter((item) => item.priority === "Critical" || item.priority === "High");
  const dummyTranscript = "Rapat koordinasi membahas genangan air di sekitar pasar induk yang rusak berat. Bapak Sekda memutuskan bahwa Dinas PUPR harus segera melakukan perbaikan darurat akses pasar induk tersebut. Sebagai action item pertama, Kepala Dinas PUPR ditugaskan untuk melakukan validasi lapangan dan dokumentasi titik kerusakan, dengan tenggat waktu hari ini (H+0). Selanjutnya, Tim teknis PUPR akan melakukan perbaikan sementara selambatnya 3 hari ke depan (H+3). Terakhir, Bappeda dan PUPR diminta menyusun rencana permanen dalam waktu dua minggu (H+14). Rapat ditutup.";
  
  const [transcriptText, setTranscriptText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saveRecord, setSaveRecord] = useState(true);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadToTranscribe(audioBlob, "recording.webm");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Gagal mengakses mikrofon: " + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadToTranscribe = async (fileOrBlob: Blob | File, filename: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileOrBlob, filename);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
      const res = await fetch(`${API_URL}/meetings/transcribe`, {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) throw new Error("Gagal mentranskrip audio");
      const data = await res.json();
      setTranscriptText((prev) => prev + (prev ? " " : "") + data.text);
    } catch (err) {
      alert("Terjadi kesalahan: " + err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadToTranscribe(file, file.name);
  };
  
  const queryClient = useQueryClient();
  const meetingMutation = useMutation<MeetingResult, Error, void>({
    mutationFn: () => runMeeting("Rapat Koordinasi", transcriptText || dummyTranscript, saveRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const result = meetingMutation.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Panel className="bg-slate-950 text-white dark:bg-black">
          <SectionTitle title="Dashboard Meeting" meta="Kasus prioritas, keputusan, PIC, deadline, progress" />
          <div className="grid gap-3 lg:grid-cols-2">
            {priorityCases.map((item) => (
              <article key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/60">{item.number}</span>
                  <Badge className={priorityTone(item.priority)}>{item.priority}</Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-6">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{item.ai_summary}</p>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <span>PIC: {item.pic ?? "Belum ditetapkan"}</span>
                  <span>OPD: {item.agency}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="AI Minutes" meta="Rangkuman rapat Wasdal" />
          {result ? (
            <div className="space-y-3">
              <DecisionLine title="Keputusan" value={result.decisions.join(", ")} />
              {result.action_items.map((ai, index) => (
                <div key={index} className="space-y-1">
                  <DecisionLine title={`Action Item ${index + 1}`} value={ai.action} />
                  <div className="flex justify-between text-xs text-muted-foreground px-3">
                    <span>PIC: {ai.assignee}</span>
                    <span>Deadline: {ai.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <DecisionLine title="Status" value="Mulai merekam, unggah dokumen rapat, atau buat notulen dari draft." />
            </div>
          )}
          
          <div className="mt-6 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={isRecording ? "danger" : "secondary"} 
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <Square size={16} /> Stop Rekam
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mic size={16} /> Mulai Rekam
                  </span>
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*,application/pdf,text/plain"
                onChange={handleFileUpload}
              />
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <span className="flex items-center gap-2">
                  <Upload size={16} /> {isUploading ? "Uploading..." : "Unggah Materi"}
                </span>
              </Button>
            </div>
            
            <Button 
              className="w-full" 
              variant="primary" 
              onClick={() => meetingMutation.mutate()}
              disabled={meetingMutation.isPending || isRecording || isUploading}
            >
              {meetingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Bot size={16} className="animate-pulse" />
                  Generating AI Minutes...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  Generate Notulen
                </span>
              )}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MeetingArchiveView() {
  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings
  });

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading arsip rapat...</div>;
  }

  if (!meetings || meetings.length === 0) {
    return (
      <Panel>
        <div className="py-12 text-center text-muted-foreground">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>Belum ada arsip rapat.</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <Panel>
        <SectionTitle title="Meeting Archive" meta="Seluruh notulen rapat, keputusan, dan tugas" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {meetings.map((meeting) => (
            <article key={meeting.id} className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {new Date(meeting.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <Badge className={meeting.confidence > 0.8 ? "border-success bg-success/10 text-success" : "border-warning bg-warning/10 text-warning"}>
                  AI Confidence: {Math.round(meeting.confidence * 100)}%
                </Badge>
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-tight text-foreground">{meeting.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meeting.summary}</p>
              
              <div className="mt-4 flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Keputusan</h4>
                  <ul className="list-inside list-disc text-sm text-foreground/80 space-y-1">
                    {meeting.decisions.map((decision, i) => (
                      <li key={i}>{decision}</li>
                    ))}
                  </ul>
                </div>
                
                {meeting.action_items && meeting.action_items.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Action Items</h4>
                    <div className="space-y-2">
                      {meeting.action_items.map((ai, i) => (
                        <div key={i} className="rounded-md bg-muted/50 p-2 text-sm border border-border/50">
                          <p className="font-medium text-foreground">{ai.task || ai.action}</p>
                          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>PIC: {ai.pic || ai.assignee || "Belum ditentukan"}</span>
                            <span>Selesai: {ai.deadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function DecisionLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className="mt-1 text-sm leading-6">{value}</div>
    </div>
  );
}

function KnowledgeView() {
  const docs = [
    { title: "SOP Rapat Wasdal dan Eskalasi Lintas OPD", type: "SOP", chunks: 12, tags: ["rapat", "eskalasi"] },
    { title: "RPJMD - Prioritas Pembangunan Daerah", type: "RPJMD", chunks: 24, tags: ["pembangunan", "indikator"] },
    { title: "Standar Harga dan DPA", type: "Dokumen Pemerintah", chunks: 18, tags: ["anggaran", "dpa"] }
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <SectionTitle title="Knowledge Base" meta="UU, PP, Permen, Perda, SOP, RPJMD, RKPD" />
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.title} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 font-medium">{doc.title}</div>
                <Badge className="border-border bg-muted text-muted-foreground">{doc.type}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <Badge key={tag} className="border-primary/20 bg-primary/10 text-primary">{tag}</Badge>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{doc.chunks} chunk siap untuk RAG.</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <SectionTitle title="Analisis Lintas Data" meta="Regulasi, kasus, lokasi, anggaran, dan histori" />
        <div className="space-y-3">
          {[
            "Kasus drainase berulang berkorelasi dengan titik pelayanan publik dan perlu paket normalisasi prioritas.",
            "Keterlambatan perizinan investasi perlu keputusan lintas OPD sebelum berdampak pada realisasi investasi.",
            "Kasus utilitas dekat sekolah masuk risiko keselamatan dan cocok sebagai quick win mingguan."
          ].map((insight) => (
            <div key={insight} className="flex items-start gap-3 rounded-md border border-border p-3">
              <ChevronRight size={16} className="mt-0.5 text-primary" />
              <p className="text-sm leading-6">{insight}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
