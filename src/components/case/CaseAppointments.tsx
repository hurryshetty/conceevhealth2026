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
import { CalendarDays, Plus, CheckCircle2, XCircle, Clock, Loader2, UserRound, Building2 } from "lucide-react";
import { addTimelineEntry } from "@/lib/caseService";

const APPT_TYPES = [
  { value: "consultation",  label: "Consultation" },
  { value: "follow_up",     label: "Follow-Up" },
  { value: "procedure",     label: "Procedure" },
  { value: "admission",     label: "Admission" },
  { value: "discharge",     label: "Discharge" },
  { value: "other",         label: "Other" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled:  { label: "Scheduled",  color: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Confirmed",  color: "bg-indigo-100 text-indigo-700" },
  completed:  { label: "Completed",  color: "bg-emerald-100 text-emerald-700" },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700" },
  no_show:    { label: "No Show",    color: "bg-gray-100 text-gray-600" },
};

interface Props { caseId: string }

const emptyForm = {
  appointment_type: "consultation",
  scheduled_at: "",
  duration_minutes: "30",
  notes: "",
  doctor_id: "",
  hospital_id: "",
};

export const CaseAppointments = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const { data: appointments = [] } = useQuery({
    queryKey: ["case-appointments", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, doctors(name), locations(name)")
        .eq("case_id", caseId)
        .order("scheduled_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("id, name, specialty").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["locations-list"],
    queryFn: async () => {
      const { data } = await supabase.from("locations").select("id, name, city").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        case_id: caseId,
        appointment_type: form.appointment_type,
        scheduled_at: form.scheduled_at,
        duration_minutes: parseInt(form.duration_minutes) || 30,
        notes: form.notes || null,
        doctor_id: form.doctor_id || null,
        hospital_id: form.hospital_id || null,
        created_by: user!.id,
      });
      if (error) throw error;
      const label = APPT_TYPES.find((t) => t.value === form.appointment_type)?.label ?? form.appointment_type;
      await addTimelineEntry(
        caseId, "appointment_scheduled",
        `${label} scheduled for ${new Date(form.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-appointments", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Appointment scheduled" });
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-appointments", caseId] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const upcoming = (appointments as any[]).filter((a) => new Date(a.scheduled_at) >= new Date() && !["cancelled", "completed"].includes(a.status));
  const past = (appointments as any[]).filter((a) => new Date(a.scheduled_at) < new Date() || ["cancelled", "completed"].includes(a.status));

  const renderAppt = (appt: any) => {
    const sc = STATUS_CONFIG[appt.status] ?? { label: appt.status, color: "bg-gray-100 text-gray-600" };
    const dt = new Date(appt.scheduled_at);
    return (
      <div key={appt.id} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {APPT_TYPES.find((t) => t.value === appt.appointment_type)?.label ?? appt.appointment_type}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <CalendarDays className="h-3 w-3" />
              {dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              {" "}at{" "}
              {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {appt.duration_minutes && ` · ${appt.duration_minutes} min`}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {appt.doctors?.name && (
                <span className="flex items-center gap-1">
                  <UserRound className="h-3 w-3" /> Dr. {appt.doctors.name}
                </span>
              )}
              {appt.locations?.name && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {appt.locations.name}
                </span>
              )}
            </div>
            {appt.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{appt.notes}</p>}
          </div>
          {appt.status === "scheduled" && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => statusMutation.mutate({ id: appt.id, status: "completed" })}
                title="Mark completed"
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => statusMutation.mutate({ id: appt.id, status: "cancelled" })}
                title="Cancel"
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Add form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Schedule Appointment</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Type</Label>
              <Select value={form.appointment_type} onValueChange={set("appointment_type")}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                className="rounded-lg text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Doctor</Label>
              <Select value={form.doctor_id} onValueChange={set("doctor_id")}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder="Select doctor…" />
                </SelectTrigger>
                <SelectContent>
                  {(doctors as any[]).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}{d.specialty ? ` — ${d.specialty}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Hospital</Label>
              <Select value={form.hospital_id} onValueChange={set("hospital_id")}>
                <SelectTrigger className="rounded-lg text-sm">
                  <SelectValue placeholder="Select hospital…" />
                </SelectTrigger>
                <SelectContent>
                  {(hospitals as any[]).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}{h.city ? ` — ${h.city}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Duration (minutes)</Label>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm((p) => ({ ...p, duration_minutes: e.target.value }))}
                className="rounded-lg text-sm"
                min={15}
                step={15}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="resize-none text-sm"
              placeholder="Instructions, preparation notes…"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={!form.scheduled_at || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Schedule
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm(emptyForm); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-1"
        >
          <Plus className="h-4 w-4" /> Schedule appointment
        </button>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h3>
          {upcoming.map(renderAppt)}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Past</h3>
          {past.map(renderAppt)}
        </div>
      )}

      {appointments.length === 0 && !showForm && (
        <p className="text-muted-foreground text-sm py-6 text-center">No appointments yet.</p>
      )}
    </div>
  );
};
