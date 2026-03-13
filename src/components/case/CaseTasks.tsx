import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, CalendarDays, UserRound, Flag, CheckCircle2, Clock, Circle, XCircle } from "lucide-react";
import { addTimelineEntry } from "@/lib/caseService";

const PRIORITY_COLOR: Record<string, string> = {
  low:      "bg-gray-100 text-gray-600",
  medium:   "bg-yellow-100 text-yellow-700",
  high:     "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: "Pending",     color: "bg-gray-100 text-gray-600",    icon: <Circle className="h-3.5 w-3.5" /> },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700",    icon: <Clock className="h-3.5 w-3.5" /> },
  completed:   { label: "Completed",   color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelled:   { label: "Cancelled",   color: "bg-red-100 text-red-700",      icon: <XCircle className="h-3.5 w-3.5" /> },
};

const STATUS_CYCLE: Record<string, string> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "pending",
  cancelled: "pending",
};

const emptyForm = {
  task_title: "",
  assigned_to: "",
  due_date: "",
  priority: "medium",
  notes: "",
};

interface Props { caseId: string }

export const CaseTasks = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [titleError, setTitleError] = useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["case-tasks", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_tasks")
        .select("*")
        .eq("case_id", caseId)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  // Fetch team members (admin + coordinator) for Assigned To
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const getUserName = (uid?: string) => {
    if (!uid) return null;
    const m = (teamMembers as any[]).find((m) => m.id === uid);
    return m?.full_name || m?.email || null;
  };

  // Create task
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_tasks").insert({
        case_id: caseId,
        task_title: form.task_title.trim(),
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        priority: form.priority,
        notes: form.notes.trim() || null,
        created_by: user!.id,
        sort_order: (tasks as any[]).length + 1,
      });
      if (error) throw error;
      await addTimelineEntry(caseId, "task_added", `Task added: "${form.task_title.trim()}"`, user!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-tasks", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Task added" });
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Update status
  const statusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      const update: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "completed") update.completed_at = new Date().toISOString();
      if (newStatus !== "completed") update.completed_at = null;
      const { error } = await supabase.from("case_tasks").update(update).eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-tasks", caseId] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleCreate = () => {
    if (!form.task_title.trim()) { setTitleError("Task title is required"); return; }
    createMutation.mutate();
  };

  const pending     = (tasks as any[]).filter((t) => t.status === "pending");
  const inProgress  = (tasks as any[]).filter((t) => t.status === "in_progress");
  const completed   = (tasks as any[]).filter((t) => t.status === "completed");

  const renderTask = (task: any) => {
    const sc = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
    const assigneeName = getUserName(task.assigned_to);
    const creatorName  = getUserName(task.created_by);
    const isOverdue    = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

    return (
      <div
        key={task.id}
        className={`bg-card border rounded-xl p-4 space-y-3 ${task.status === "completed" ? "opacity-70" : "border-border"}`}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-snug ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.task_title}
            </p>
            {task.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{task.notes}</p>}
          </div>
          {/* Priority badge */}
          <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLOR[task.priority] ?? ""}`}>
            <Flag className="h-2.5 w-2.5 inline mr-0.5" />{task.priority}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {assigneeName && (
            <span className="flex items-center gap-1">
              <UserRound className="h-3 w-3" /> {assigneeName}
            </span>
          )}
          {creatorName && (
            <span className="flex items-center gap-1 opacity-70">
              Created by {creatorName}
            </span>
          )}
          {task.created_at && (
            <span className="flex items-center gap-1 opacity-70">
              <CalendarDays className="h-3 w-3" />
              {new Date(task.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-destructive" : ""}`}>
              Due: {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {isOverdue && " ⚠"}
            </span>
          )}
          {task.completed_at && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Completed {new Date(task.completed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Status action buttons */}
        {task.status !== "cancelled" && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
            {(["pending", "in_progress", "completed"] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const isActive = task.status === s;
              return (
                <button
                  key={s}
                  onClick={() => !isActive && statusMutation.mutate({ taskId: task.id, newStatus: s })}
                  disabled={isActive || statusMutation.isPending}
                  className={`inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full font-medium border transition-all
                    ${isActive
                      ? `${cfg.color} border-transparent cursor-default`
                      : "bg-transparent border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Add task form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Add Task</h3>

          <div>
            <Label className="text-xs mb-1.5 block">Task Title <span className="text-destructive">*</span></Label>
            <Input
              value={form.task_title}
              onChange={(e) => { set("task_title")(e.target.value); setTitleError(""); }}
              placeholder="e.g. Collect medical reports"
              className={`rounded-lg text-sm ${titleError ? "border-destructive" : ""}`}
              autoFocus
            />
            {titleError && <p className="text-[11px] text-destructive mt-1">{titleError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Assigned To</Label>
              <Select value={form.assigned_to} onValueChange={set("assigned_to")}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder="Select team member…" />
                </SelectTrigger>
                <SelectContent>
                  {(teamMembers as any[]).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Priority</Label>
              <Select value={form.priority} onValueChange={set("priority")}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date")(e.target.value)}
                className="rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Notes <span className="text-muted-foreground text-[11px]">(optional)</span></Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              placeholder="Additional instructions…"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Task
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm(emptyForm); setTitleError(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-1"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      )}

      {/* Task groups */}
      {inProgress.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">In Progress ({inProgress.length})</h3>
          {inProgress.map(renderTask)}
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending ({pending.length})</h3>
          {pending.map(renderTask)}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed ({completed.length})</h3>
          {completed.map(renderTask)}
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <p className="text-muted-foreground text-sm py-6 text-center">No tasks yet.</p>
      )}
    </div>
  );
};
