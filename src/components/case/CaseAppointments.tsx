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
import { CalendarDays, Plus, CheckCircle2, XCircle, Loader2, UserRound, Building2, RefreshCw } from "lucide-react";
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [rescheduleRemark, setRescheduleRemark] = useState("");

  const { data: appointments = [] } = useQuery({
    queryKey: ["case-appointments", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("case_id", caseId)
        .order("scheduled_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: allDoctors = [] } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, name, specialty, hospitals")
        .eq("is_published", true)
        .order("name");
      return data ?? [];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["locations-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("id, name")
        .eq("is_published", true)
        .order("name");
      return data ?? [];
    },
  });

  // Filter doctors to only those who belong to the selected hospital.
  // Comparison is case-insensitive + trimmed to handle minor data mismatches.
  const selectedHospitalName = (hospitals as any[]).find((h) => h.id === form.hospital_id)?.name ?? "";
  const normalise = (s: string) => s.trim().toLowerCase();
  const filteredDoctors = selectedHospitalName
    ? (allDoctors as any[]).filter((d) => {
        if (!d.hospitals) return false;
        const arr: string[] = Array.isArray(d.hospitals) ? d.hospitals : [String(d.hospitals)];
        // Doctors store "Hospital Name City", locations store "Hospital Name"
        // so check if either starts with the other (handles both exact and city-suffixed)
        return arr.some((h) =>
          normalise(h).startsWith(normalise(selectedHospitalName)) ||
          normalise(selectedHospitalName).startsWith(normalise(h)),
        );
      })
    : [];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.appointment_type) errors.appointment_type = "Required";
    if (!form.scheduled_at) errors.scheduled_at = "Required";
    if (!form.hospital_id) errors.hospital_id = "Required";
    if (!form.doctor_id) errors.doctor_id = "Required";
    if (!form.duration_minutes || parseInt(form.duration_minutes) < 15) errors.duration_minutes = "Minimum 15 minutes";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (key: string) => setFormErrors((e) => ({ ...e, [key]: "" }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const hospitalName = (hospitals as any[]).find((h) => h.id === form.hospital_id)?.name ?? "";
      const doctorName = (allDoctors as any[]).find((d) => d.id === form.doctor_id)?.name ?? "";

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
        `${label} scheduled for ${new Date(form.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} at ${hospitalName} with Dr. ${doctorName}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-appointments", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Appointment scheduled" });
      setForm(emptyForm);
      setFormErrors({});
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
      await addTimelineEntry(caseId, `appointment_${status}`, `Appointment ${status}`, user!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-appointments", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").update({
        scheduled_at: rescheduleAt,
        status: "scheduled",
        notes: rescheduleRemark || null,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      await addTimelineEntry(
        caseId, "appointment_rescheduled",
        `Appointment rescheduled to ${new Date(rescheduleAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}${rescheduleRemark ? ` — ${rescheduleRemark}` : ""}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-appointments", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Appointment rescheduled" });
      setRescheduleId(null);
      setRescheduleAt("");
      setRescheduleRemark("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const upcoming = (appointments as any[]).filter(
    (a) => new Date(a.scheduled_at) >= new Date() && !["cancelled", "completed"].includes(a.status),
  );
  const past = (appointments as any[]).filter(
    (a) => new Date(a.scheduled_at) < new Date() || ["cancelled", "completed"].includes(a.status),
  );

  const renderAppt = (appt: any) => {
    const sc = STATUS_CONFIG[appt.status] ?? { label: appt.status, color: "bg-gray-100 text-gray-600" };
    const dt = new Date(appt.scheduled_at);
    const hospitalName = (hospitals as any[]).find((h) => h.id === appt.hospital_id)?.name;
    const doctor = (allDoctors as any[]).find((d) => d.id === appt.doctor_id);
    const isRescheduling = rescheduleId === appt.id;

    return (
      <div key={appt.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
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
            {doctor && (
              <span className="flex items-center gap-1">
                <UserRound className="h-3 w-3" /> Dr. {doctor.name}{doctor.specialty ? ` (${doctor.specialty})` : ""}
              </span>
            )}
            {hospitalName && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {hospitalName}
              </span>
            )}
          </div>
          {appt.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{appt.notes}</p>}
        </div>

        {/* Action buttons */}
        {appt.status === "scheduled" && !isRescheduling && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => {
                if (confirm("Mark this appointment as completed?")) {
                  statusMutation.mutate({ id: appt.id, status: "completed" });
                }
              }}
              disabled={statusMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Completed
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 hover:bg-primary/5"
              onClick={() => {
                setRescheduleId(appt.id);
                setRescheduleAt("");
                setRescheduleRemark("");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
              onClick={() => {
                if (confirm("Cancel this appointment?")) {
                  statusMutation.mutate({ id: appt.id, status: "cancelled" });
                }
              }}
              disabled={statusMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
              Cancel Appointment
            </Button>
          </div>
        )}

        {/* Reschedule inline form */}
        {isRescheduling && (
          <div className="border-t border-border pt-3 space-y-3">
            <p className="text-xs font-semibold text-foreground">Reschedule Appointment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">New Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={rescheduleAt}
                  onChange={(e) => setRescheduleAt(e.target.value)}
                  className="rounded-lg text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Reason / Remarks</Label>
                <Input
                  value={rescheduleRemark}
                  onChange={(e) => setRescheduleRemark(e.target.value)}
                  placeholder="e.g. Doctor unavailable"
                  className="rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => rescheduleMutation.mutate(appt.id)}
                disabled={!rescheduleAt || rescheduleMutation.isPending}
                className="gap-1.5"
              >
                {rescheduleMutation.isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <RefreshCw className="h-3.5 w-3.5" />}
                Confirm Reschedule
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRescheduleId(null)}>Discard</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Schedule form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Schedule Appointment</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <Label className="text-xs mb-1.5 block">Type <span className="text-destructive">*</span></Label>
              <Select
                value={form.appointment_type}
                onValueChange={(v) => { setForm((p) => ({ ...p, appointment_type: v })); clearError("appointment_type"); }}
              >
                <SelectTrigger className={`rounded-lg text-sm ${formErrors.appointment_type ? "border-destructive" : ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div>
              <Label className="text-xs mb-1.5 block">Date & Time <span className="text-destructive">*</span></Label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => { setForm((p) => ({ ...p, scheduled_at: e.target.value })); clearError("scheduled_at"); }}
                className={`rounded-lg text-sm ${formErrors.scheduled_at ? "border-destructive" : ""}`}
              />
              {formErrors.scheduled_at && <p className="text-[11px] text-destructive mt-1">{formErrors.scheduled_at}</p>}
            </div>

            {/* Hospital */}
            <div>
              <Label className="text-xs mb-1.5 block">Hospital <span className="text-destructive">*</span></Label>
              <Select
                value={form.hospital_id}
                onValueChange={(v) => { setForm((p) => ({ ...p, hospital_id: v, doctor_id: "" })); clearError("hospital_id"); clearError("doctor_id"); }}
              >
                <SelectTrigger className={`rounded-lg text-sm ${formErrors.hospital_id ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={hospitals.length === 0 ? "No approved hospitals" : "Select hospital…"} />
                </SelectTrigger>
                <SelectContent>
                  {(hospitals as any[]).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.hospital_id && <p className="text-[11px] text-destructive mt-1">{formErrors.hospital_id}</p>}
            </div>

            {/* Doctor */}
            <div>
              <Label className="text-xs mb-1.5 block">Doctor <span className="text-destructive">*</span></Label>
              <Select
                value={form.doctor_id}
                onValueChange={(v) => { setForm((p) => ({ ...p, doctor_id: v })); clearError("doctor_id"); }}
                disabled={!form.hospital_id}
              >
                <SelectTrigger className={`rounded-lg text-sm ${formErrors.doctor_id ? "border-destructive" : ""}`}>
                  <SelectValue
                    placeholder={
                      !form.hospital_id
                        ? "Select hospital first"
                        : filteredDoctors.length === 0
                          ? "No doctors for this hospital"
                          : "Select doctor…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}{d.specialty ? ` — ${d.specialty}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doctor_id && <p className="text-[11px] text-destructive mt-1">{formErrors.doctor_id}</p>}
            </div>

            {/* Duration */}
            <div>
              <Label className="text-xs mb-1.5 block">Duration (minutes) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => { setForm((p) => ({ ...p, duration_minutes: e.target.value })); clearError("duration_minutes"); }}
                className={`rounded-lg text-sm ${formErrors.duration_minutes ? "border-destructive" : ""}`}
                min={15}
                step={15}
              />
              {formErrors.duration_minutes && <p className="text-[11px] text-destructive mt-1">{formErrors.duration_minutes}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs mb-1.5 block">Notes <span className="text-muted-foreground text-[11px]">(optional)</span></Label>
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
              onClick={() => { if (validate()) createMutation.mutate(); }}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Schedule
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowForm(false); setForm(emptyForm); setFormErrors({}); }}
            >
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
