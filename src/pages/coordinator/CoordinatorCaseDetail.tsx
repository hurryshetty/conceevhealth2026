import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Send, Lock, Building2, UserRound, CheckCircle2,
  Circle, Clock, ListTodo, GitBranch, StickyNote, Layers,
  CalendarDays, IndianRupee, AlertTriangle, Plus, Loader2,
  FileText, Banknote,
} from "lucide-react";
import {
  assignCase, updateCaseStage, addTimelineEntry,
} from "@/lib/caseService";
import { CaseDocuments } from "@/components/case/CaseDocuments";
import { CaseAppointments } from "@/components/case/CaseAppointments";
import { CaseBilling } from "@/components/case/CaseBilling";
import { CaseTasks } from "@/components/case/CaseTasks";
import { CaseSettlements } from "@/components/case/CaseSettlements";

// ─── Constants ────────────────────────────────────────────────────────────────

const CASE_STAGES = [
  { value: "case_created",              label: "Case Created" },
  { value: "assignment_pending",        label: "Assignment Pending" },
  { value: "assigned",                  label: "Assigned" },
  { value: "consultation_scheduled",    label: "Consultation Scheduled" },
  { value: "consultation_completed",    label: "Consultation Completed" },
  { value: "pre_treatment",             label: "Pre-Treatment" },
  { value: "treatment_confirmed",       label: "Treatment Confirmed" },
  { value: "admitted",                  label: "Admitted" },
  { value: "treatment_in_progress",     label: "Treatment In Progress" },
  { value: "recovery",                  label: "Recovery" },
  { value: "discharged",               label: "Discharged" },
  { value: "followup",                  label: "Follow-Up" },
  { value: "billing_pending",           label: "Billing Pending" },
  { value: "closed",                    label: "Closed" },
  { value: "cancelled",                 label: "Cancelled" },
  { value: "on_hold",                   label: "On Hold" },
  { value: "escalated",                 label: "Escalated" },
];

const STAGE_COLOR: Record<string, string> = {
  case_created:           "bg-blue-100 text-blue-700",
  assignment_pending:     "bg-orange-100 text-orange-700",
  assigned:               "bg-purple-100 text-purple-700",
  consultation_scheduled: "bg-indigo-100 text-indigo-700",
  consultation_completed: "bg-cyan-100 text-cyan-700",
  pre_treatment:          "bg-yellow-100 text-yellow-700",
  treatment_confirmed:    "bg-lime-100 text-lime-700",
  admitted:               "bg-teal-100 text-teal-700",
  treatment_in_progress:  "bg-emerald-100 text-emerald-700",
  recovery:               "bg-green-100 text-green-700",
  discharged:             "bg-green-200 text-green-800",
  followup:               "bg-sky-100 text-sky-700",
  billing_pending:        "bg-amber-100 text-amber-700",
  closed:                 "bg-gray-200 text-gray-700",
  cancelled:              "bg-red-100 text-red-700",
  on_hold:                "bg-zinc-100 text-zinc-700",
  escalated:              "bg-rose-100 text-rose-700",
};


type TabId = "overview" | "assignment" | "tasks" | "timeline" | "notes" | "documents" | "appointments" | "billing" | "settlements";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",     icon: Layers },
  { id: "assignment",   label: "Assignment",   icon: Building2 },
  { id: "tasks",        label: "Tasks",        icon: ListTodo },
  { id: "documents",    label: "Documents",    icon: FileText },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "billing",      label: "Billing",      icon: IndianRupee },
  { id: "settlements",  label: "Settlements",  icon: Banknote },
  { id: "timeline",     label: "Timeline",     icon: GitBranch },
  { id: "notes",        label: "Notes",        icon: StickyNote },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CoordinatorCaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStage, setNewStage] = useState("");
  const [assignHospitalId, setAssignHospitalId] = useState<string>("");

  // ── Data queries ─────────────────────────────────────────────────────────

  const { data: caseData, isLoading, isError, error } = useQuery({
    queryKey: ["case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: leadData } = useQuery({
    queryKey: ["case-lead", caseData?.lead_id],
    enabled: !!caseData?.lead_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("name, phone, email, city, procedure_interest, crm_status, created_at")
        .eq("id", caseData!.lead_id)
        .single();
      return data;
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["locations-list-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, is_published")
        .eq("is_published", true)
        .order("name");
      if (error) console.error("locations query error:", error);
      return data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, designation, hospitals, is_published")
        .eq("is_published", true)
        .order("name");
      if (error) console.error("doctors query error:", error);
      return data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ["case-tasks", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_tasks")
        .select("*")
        .eq("case_id", id!)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ["case-timeline", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_timeline")
        .select("*, profiles!performed_by(full_name)")
        .eq("case_id", id!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_notes")
        .select("*")
        .eq("case_id", id!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const stageMutation = useMutation({
    mutationFn: async (stage: string) => {
      await updateCaseStage(id!, stage, user!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-detail", id] });
      qc.invalidateQueries({ queryKey: ["case-timeline", id] });
      toast({ title: "Stage updated" });
      setNewStage("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: async (assignments: { hospitalId?: string | null; doctorId?: string | null }) => {
      const hospital = assignments.hospitalId
        ? hospitals.find((h: any) => h.id === assignments.hospitalId)
        : undefined;
      const doctor = assignments.doctorId
        ? doctors.find((d: any) => d.id === assignments.doctorId)
        : undefined;
      await assignCase(
        id!,
        assignments,
        user!.id,
        hospital?.name,
        doctor?.name,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-detail", id] });
      qc.invalidateQueries({ queryKey: ["case-timeline", id] });
      toast({ title: "Assignment saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const costMutation = useMutation({
    mutationFn: async (cost: number) => {
      const { error } = await supabase
        .from("patient_cases")
        .update({ estimated_package_cost: cost })
        .eq("id", id!);
      if (error) throw error;
      await addTimelineEntry(id!, "cost_updated", `Estimated cost set to ₹${cost.toLocaleString("en-IN")}`, user!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-detail", id] });
      qc.invalidateQueries({ queryKey: ["case-timeline", id] });
      toast({ title: "Cost updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });


  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_notes").insert({
        case_id: id!,
        author_id: user!.id,
        content: noteText,
        is_internal: isInternal,
      });
      if (error) throw error;
      await addTimelineEntry(
        id!,
        "note_added",
        isInternal ? "Internal note added" : "Note added",
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-notes", id] });
      qc.invalidateQueries({ queryKey: ["case-timeline", id] });
      setNoteText("");
      toast({ title: "Note added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-10 text-center space-y-2">
        <p className="text-destructive font-medium">Failed to load case</p>
        <p className="text-sm text-muted-foreground">{(error as any)?.message ?? "Unknown error"}</p>
        <p className="text-xs text-muted-foreground">Case ID: {id}</p>
      </div>
    );
  }
  if (!caseData) {
    return <p className="text-muted-foreground py-10 text-center">Case not found.</p>;
  }

  const stageLabel = CASE_STAGES.find((s) => s.value === caseData.case_stage)?.label ?? caseData.case_stage;
  const completedTasks = (tasks as any[]).filter((t) => t.status === "completed").length;

  // Derive names from already-fetched lists (avoids FK join issues)
  const assignedHospital = (hospitals as any[]).find((h) => h.id === caseData.hospital_id);
  const assignedDoctor = (doctors as any[]).find((d) => d.id === caseData.doctor_id);

  // For the assignment tab: use pending selection or fall back to saved hospital
  const effectiveHospitalId = assignHospitalId || caseData.hospital_id || "";
  const effectiveHospital = (hospitals as any[]).find((h) => h.id === effectiveHospitalId);
  // Filter doctors to those who work at the selected hospital
  const normH = (s: string) => s.trim().toLowerCase();
  const filteredDoctors = effectiveHospital
    ? (doctors as any[]).filter((d) => {
        if (!d.hospitals) return false;
        const arr: string[] = Array.isArray(d.hospitals) ? d.hospitals : [String(d.hospitals)];
        return arr.some((h) =>
          normH(h).startsWith(normH(effectiveHospital.name)) ||
          normH(effectiveHospital.name).startsWith(normH(h)),
        );
      })
    : [];

  return (
    <div>
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Cases
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <p className="text-xs font-mono text-muted-foreground mb-0.5">
            {caseData.case_code || caseData.case_number || "—"}
          </p>
          <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">{caseData.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_COLOR[caseData.case_stage] ?? "bg-secondary text-muted-foreground"}`}>
              {stageLabel}
            </span>
            {caseData.priority && (
              <span className="text-xs text-muted-foreground capitalize">Priority: {caseData.priority}</span>
            )}
            {caseData.is_escalated && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Escalated
              </span>
            )}
          </div>
        </div>
        {/* Quick stage update */}
        <div className="flex items-center gap-2">
          <Select value={newStage} onValueChange={setNewStage}>
            <SelectTrigger className="w-[200px] rounded-lg text-sm">
              <SelectValue placeholder="Change stage…" />
            </SelectTrigger>
            <SelectContent>
              {CASE_STAGES.filter((s) => s.value !== caseData.case_stage).map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            disabled={!newStage || stageMutation.isPending}
            onClick={() => stageMutation.mutate(newStage)}
            className="rounded-lg"
          >
            {stageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "tasks" && tasks.length > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                }`}>
                  {completedTasks}/{tasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Case Info */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Case Information</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Specialty</p>
                <p className="font-medium">{(caseData as any).specialties?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                <p className="font-medium capitalize">{caseData.priority ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Hospital</p>
                <p className="font-medium">{assignedHospital?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Doctor</p>
                <p className="font-medium">{assignedDoctor?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p>
                <p className="font-medium">
                  {caseData.estimated_package_cost
                    ? `₹${Number(caseData.estimated_package_cost).toLocaleString("en-IN")}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Treatment Date</p>
                <p className="font-medium">
                  {caseData.expected_treatment_date
                    ? new Date(caseData.expected_treatment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Consultation</p>
                <p className="font-medium capitalize">{caseData.consultation_status ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Payment</p>
                <p className="font-medium capitalize">{caseData.payment_status ?? "—"}</p>
              </div>
            </div>
            {caseData.description && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{caseData.description}</p>
              </div>
            )}
            <div className="pt-3 border-t border-border text-xs text-muted-foreground">
              Created: {new Date(caseData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Lead Source */}
          {leadData && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-foreground">Patient / Lead</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="font-medium">{leadData.name}</p>
                </div>
                {leadData.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <a href={`tel:${leadData.phone}`} className="font-medium text-primary hover:underline">{leadData.phone}</a>
                  </div>
                )}
                {leadData.email && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <a href={`mailto:${leadData.email}`} className="font-medium text-primary hover:underline truncate block">{leadData.email}</a>
                  </div>
                )}
                {leadData.city && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">City</p>
                    <p className="font-medium">{leadData.city}</p>
                  </div>
                )}
                {leadData.procedure_interest && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Procedure Interest</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{leadData.procedure_interest}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Summary */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Task Progress</h2>
              <span className="text-sm text-muted-foreground">{completedTasks} / {tasks.length} completed</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: tasks.length ? `${(completedTasks / tasks.length) * 100}%` : "0%" }}
              />
            </div>
            <div className="space-y-2">
              {(tasks as any[]).slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  {task.status === "completed"
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : task.status === "in_progress"
                    ? <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                  <span className={task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}>
                    {task.task_title}
                  </span>
                </div>
              ))}
              {tasks.length > 5 && (
                <button onClick={() => setActiveTab("tasks")} className="text-xs text-primary hover:underline mt-1">
                  View all {tasks.length} tasks →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Assignment Tab ────────────────────────────────────────────────── */}
      {activeTab === "assignment" && (
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
          {/* Hospital */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Hospital</h3>
            </div>
            {assignedHospital && (
              <p className="text-xs text-muted-foreground mb-2">
                Current: <span className="font-medium text-foreground">{assignedHospital.name}</span>
              </p>
            )}
            {hospitals.length === 0 ? (
              <p className="text-xs text-muted-foreground">No approved hospitals found.</p>
            ) : (
              <Select
                value={effectiveHospitalId}
                onValueChange={(v) => {
                  setAssignHospitalId(v);
                  assignMutation.mutate({ hospitalId: v });
                }}
              >
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder="Select hospital…" />
                </SelectTrigger>
                <SelectContent>
                  {(hospitals as any[]).map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {assignMutation.isPending && <p className="text-xs text-muted-foreground mt-1">Saving…</p>}
          </div>

          {/* Doctor */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Doctor</h3>
            </div>
            {assignedDoctor && (
              <p className="text-xs text-muted-foreground mb-2">
                Current: <span className="font-medium text-foreground">{assignedDoctor.name}</span>
              </p>
            )}
            {!effectiveHospitalId ? (
              <p className="text-xs text-muted-foreground">Select a hospital first to see available doctors.</p>
            ) : filteredDoctors.length === 0 ? (
              <p className="text-xs text-muted-foreground">No approved doctors found for this hospital.</p>
            ) : (
              <Select
                value={caseData.doctor_id ?? ""}
                onValueChange={(v) => assignMutation.mutate({ doctorId: v })}
              >
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder="Select doctor…" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}{d.designation ? ` — ${d.designation}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Estimated Cost */}
          <div className="bg-card border border-border rounded-xl p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Estimated Package Cost (INR)</h3>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                defaultValue={caseData.estimated_package_cost ?? ""}
                placeholder="0.00"
                className="rounded-lg text-sm"
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val !== caseData.estimated_package_cost) {
                    costMutation.mutate(val);
                  }
                }}
              />
              {costMutation.isPending && <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />}
            </div>
          </div>

          {/* Expected Treatment Date */}
          <div className="bg-card border border-border rounded-xl p-5 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Expected Treatment Date</h3>
            </div>
            <Input
              type="date"
              defaultValue={caseData.expected_treatment_date ?? ""}
              className="rounded-lg text-sm max-w-xs"
              onBlur={(e) => {
                const val = e.target.value;
                if (val && val !== caseData.expected_treatment_date) {
                  supabase
                    .from("patient_cases")
                    .update({ expected_treatment_date: val })
                    .eq("id", id!)
                    .then(({ error }) => {
                      if (error) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                      } else {
                        qc.invalidateQueries({ queryKey: ["case-detail", id] });
                        toast({ title: "Treatment date updated" });
                      }
                    });
                }
              }}
            />
          </div>
        </div>
      )}

      {/* ── Tasks Tab ────────────────────────────────────────────────────── */}
      {activeTab === "tasks" && <CaseTasks caseId={id!} />}

      {/* ── Documents Tab ────────────────────────────────────────────────── */}
      {activeTab === "documents" && <CaseDocuments caseId={id!} />}

      {/* ── Appointments Tab ──────────────────────────────────────────────── */}
      {activeTab === "appointments" && <CaseAppointments caseId={id!} />}

      {/* ── Billing Tab ───────────────────────────────────────────────────── */}
      {activeTab === "billing" && <CaseBilling caseId={id!} />}

      {/* ── Settlements Tab ───────────────────────────────────────────────── */}
      {activeTab === "settlements" && <CaseSettlements caseId={id!} />}

      {/* ── Timeline Tab ─────────────────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <div className="max-w-2xl">
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm py-10 text-center">No timeline entries yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {(timeline as any[]).map((entry) => (
                  <div key={entry.id} className="flex gap-4 pl-10 relative">
                    <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                    <div className="flex-1 bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {entry.action_type.replace(/_/g, " ")}
                        </p>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      )}
                      {entry.profiles?.full_name && (
                        <p className="text-xs text-muted-foreground/70 mt-1">by {entry.profiles.full_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Notes Tab ────────────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="max-w-2xl space-y-4">
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-6 text-center">No notes yet.</p>
            ) : (
              (notes as any[]).map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl text-sm border ${
                    note.is_internal
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-medium text-foreground">{"Coordinator"}</span>
                    {note.is_internal && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" /> Internal
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{note.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Note */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Add Note</h3>
            <Textarea
              placeholder="Add update, follow-up note, patient response…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                Internal only (not visible to patient)
              </label>
              <Button
                size="sm"
                onClick={() => addNoteMutation.mutate()}
                disabled={!noteText.trim() || addNoteMutation.isPending}
                className="gap-2"
              >
                {addNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorCaseDetail;
