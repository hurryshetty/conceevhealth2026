import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ArrowRight } from "lucide-react";

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

const CoordinatorCases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", specialty_id: "", priority: "medium", patient_email: "" });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["coordinator-cases-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), locations(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data } = await supabase.from("specialties").select("id, name").order("sort_order");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      // Find patient by email
      let patientId: string | null = null;
      if (f.patient_email) {
        const { data: users } = await supabase
          .from("user_roles")
          .select("user_id")
          .limit(1);
        // We'll use the coordinator's own ID as patient for now if email lookup not available
        const { data: session } = await supabase.auth.getSession();
        patientId = session.session?.user.id ?? null;
      }
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.from("patient_cases").insert({
        title: f.title,
        description: f.description,
        specialty_id: f.specialty_id || null,
        priority: f.priority,
        patient_id: session.session!.user.id,
        coordinator_id: session.session!.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coordinator-cases-all"] });
      toast({ title: "Case created" });
      setCreateOpen(false);
      setForm({ title: "", description: "", specialty_id: "", priority: "medium", patient_email: "" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = cases.filter((c: any) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.case_code ?? c.case_number ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.case_stage === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Cases</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Case
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {CASE_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cases list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-muted-foreground p-6">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center">No cases found</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/coordinator/cases/${c.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      {c.case_code || c.case_number || "—"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLOR[c.case_stage] ?? "bg-gray-100 text-gray-600"}`}>
                      {CASE_STAGES.find((s) => s.value === c.case_stage)?.label ?? c.case_stage ?? "—"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">• {c.priority}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}
                    {c.locations?.name ? ` • ${c.locations.name}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-4 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Case Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Case</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Case Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. IVF Treatment - Mumbai" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Specialty</Label>
              <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Case"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorCases;
