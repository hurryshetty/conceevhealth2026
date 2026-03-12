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
import { Plus, Loader2, Banknote, CheckCircle2, Clock, XCircle, Building2, UserRound } from "lucide-react";

const PAYEE_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "doctor",   label: "Doctor" },
  { value: "lab",      label: "Lab" },
  { value: "other",    label: "Other" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  paid:       { label: "Paid",       color: "bg-emerald-100 text-emerald-700" },
  failed:     { label: "Failed",     color: "bg-red-100 text-red-700" },
};

const emptyForm = {
  payee_type: "hospital",
  hospital_id: "",
  doctor_id: "",
  amount: "",
  reference_number: "",
  notes: "",
};

interface Props { caseId: string }

export const CaseSettlements = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const { data: settlements = [] } = useQuery({
    queryKey: ["case-settlements", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("settlements")
        .select("*, locations(name), doctors(name)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
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

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("id, name, specialty").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      const { error } = await supabase.from("settlements").insert({
        case_id: caseId,
        payee_type: form.payee_type,
        hospital_id: form.hospital_id || null,
        doctor_id: form.doctor_id || null,
        amount,
        reference_number: form.reference_number || null,
        notes: form.notes || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-settlements", caseId] });
      toast({ title: "Settlement created" });
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const update: any = { status, updated_at: new Date().toISOString() };
      if (status === "paid") update.settled_at = new Date().toISOString();
      const { error } = await supabase.from("settlements").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-settlements", caseId] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const totalPending = (settlements as any[])
    .filter((s) => s.status === "pending" || s.status === "processing")
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const totalPaid = (settlements as any[])
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="max-w-2xl space-y-4">
      {/* Summary */}
      {settlements.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Pending / Processing", amount: totalPending, color: "text-yellow-600" },
            { label: "Total Settled",        amount: totalPaid,    color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>₹{s.amount.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">New Settlement</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Payee Type</Label>
              <Select value={form.payee_type} onValueChange={set("payee_type")}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYEE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                className="rounded-lg text-sm"
              />
            </div>
            {(form.payee_type === "hospital") && (
              <div className="col-span-2">
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
            )}
            {(form.payee_type === "doctor") && (
              <div className="col-span-2">
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
            )}
            <div>
              <Label className="text-xs mb-1.5 block">Reference Number</Label>
              <Input
                value={form.reference_number}
                onChange={(e) => setForm((p) => ({ ...p, reference_number: e.target.value }))}
                placeholder="TXN-001"
                className="rounded-lg text-sm"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={!form.amount || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Settlement
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
          <Plus className="h-4 w-4" /> Add settlement
        </button>
      )}

      {/* Settlement list */}
      {settlements.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm py-6 text-center">No settlements yet.</p>
      ) : (
        <div className="space-y-2">
          {(settlements as any[]).map((item) => {
            const sc = STATUS_CONFIG[item.status] ?? { label: item.status, color: "bg-gray-100 text-gray-600" };
            const payeeLabel = PAYEE_TYPES.find((t) => t.value === item.payee_type)?.label ?? item.payee_type;
            const payeeName = item.locations?.name ?? item.doctors?.name ?? payeeLabel;
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Banknote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-foreground">{payeeName}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">₹{Number(item.amount).toLocaleString("en-IN")}</span>
                      <span className="flex items-center gap-1">
                        {item.payee_type === "hospital"
                          ? <Building2 className="h-3 w-3" />
                          : item.payee_type === "doctor"
                          ? <UserRound className="h-3 w-3" />
                          : null}
                        {payeeLabel}
                      </span>
                      {item.reference_number && <span>Ref: {item.reference_number}</span>}
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>}
                    {item.settled_at && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Settled on {new Date(item.settled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {(item.status === "pending" || item.status === "processing") && (
                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === "pending" && (
                        <button
                          onClick={() => statusMutation.mutate({ id: item.id, status: "processing" })}
                          title="Mark as processing"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => statusMutation.mutate({ id: item.id, status: "paid" })}
                        title="Mark as paid"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: item.id, status: "failed" })}
                        title="Mark as failed"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
