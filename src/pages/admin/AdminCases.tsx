import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, Loader2 } from "lucide-react";

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

// ─── Component ────────────────────────────────────────────────────────────────

const AdminCases = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const { data: cases = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-cases-all"],
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("id, title, case_code, case_stage, priority, created_at, specialties(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.case_code ?? c.case_number ?? "").toLowerCase().includes(q);
      const matchStage = stageFilter === "all" || c.case_stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [cases, search, stageFilter]);

  // Stage summary counts
  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cases) {
      const s = c.case_stage ?? "unknown";
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [cases]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-foreground">Cases</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cases.length} total cases</p>
        </div>
      </div>

      {/* Stage summary pills */}
      {cases.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {CASE_STAGES.filter((s) => stageCounts[s.value]).map((s) => (
            <button
              key={s.value}
              onClick={() => setStageFilter(stageFilter === s.value ? "all" : s.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                stageFilter === s.value
                  ? `${STAGE_COLOR[s.value]} border-current`
                  : "bg-secondary text-muted-foreground border-transparent hover:border-border"
              }`}
            >
              {s.label}
              <span className="font-bold">{stageCounts[s.value]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or case code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-52 rounded-lg">
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

      <p className="text-sm text-muted-foreground mb-4">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> case{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== cases.length && ` (filtered from ${cases.length})`}
      </p>

      {/* Cases list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading cases…
          </div>
        ) : isError ? (
          <div className="py-16 text-center space-y-1">
            <p className="text-destructive font-medium">Failed to load cases</p>
            <p className="text-xs text-muted-foreground">{(error as any)?.message ?? "Unknown error"}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No cases found.</p>
            {stageFilter !== "all" && (
              <button onClick={() => setStageFilter("all")} className="text-xs text-primary hover:underline mt-1">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/cases/${c.id}`)}
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
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCases;
