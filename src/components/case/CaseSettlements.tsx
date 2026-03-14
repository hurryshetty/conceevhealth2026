import { useState, useRef } from "react";
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
  Plus, Loader2, Banknote, CheckCircle2, Clock, XCircle,
  Building2, UserRound, Upload, Eye, Percent,
} from "lucide-react";
import { addTimelineEntry } from "@/lib/caseService";

const PAYEE_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "doctor",   label: "Doctor" },
  { value: "lab",      label: "Lab" },
  { value: "other",    label: "Other" },
];

const TRANSFER_MODES = [
  { value: "upi",           label: "UPI",           refLabel: "Transaction ID / UTR" },
  { value: "bank_transfer", label: "Bank Transfer",  refLabel: "Reference / NEFT / IMPS No." },
  { value: "card",          label: "Card",           refLabel: "Transaction ID" },
  { value: "cheque",        label: "Cheque",         refLabel: "Cheque Number" },
  { value: "cash",          label: "Cash",           refLabel: null },
  { value: "other",         label: "Other",          refLabel: "Reference" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  paid:       { label: "Paid",       color: "bg-emerald-100 text-emerald-700" },
  failed:     { label: "Failed",     color: "bg-red-100 text-red-700" },
};

interface Props {
  caseId: string;
  caseHospitalId?: string;   // pre-select hospital from case assignment
  readOnly?: boolean;
}

const emptyForm = {
  payee_type: "hospital",
  hospital_id: "",
  doctor_id: "",
  settlement_percentage: "",
  amount: "",
  payment_method: "bank_transfer",
  payment_reference: "",
  notes: "",
};

export const CaseSettlements = ({ caseId, caseHospitalId, readOnly }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const proofRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>(() => ({
    ...emptyForm,
    hospital_id: caseHospitalId ?? "",
  }));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [proofUploading, setProofUploading] = useState(false);
  const [proofPath, setProofPath] = useState("");

  // For "Mark as Paid" inline panel
  const [payItemId, setPayItemId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payProofPath, setPayProofPath] = useState("");
  const [payProofUploading, setPayProofUploading] = useState(false);
  const payProofRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      // Recalculate amount when percentage changes
      if (k === "settlement_percentage") {
        const pct = parseFloat(v);
        if (!isNaN(pct) && totalBilled > 0) {
          next.amount = ((totalBilled * pct) / 100).toFixed(2);
        }
      }
      return next;
    });
    if (formErrors[k]) setFormErrors((e) => ({ ...e, [k]: "" }));
  };

  // ── Data queries ─────────────────────────────────────────────────────────

  const { data: settlements = [] } = useQuery({
    queryKey: ["case-settlements", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("settlements")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Total billing for percentage calculation
  const { data: billingItems = [] } = useQuery({
    queryKey: ["case-billing", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_billing")
        .select("amount, status")
        .eq("case_id", caseId);
      return data ?? [];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["locations-list-published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("id, name")
        .eq("is_published", true)
        .order("name");
      return data ?? [];
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list-published"],
    queryFn: async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id, name, designation")
        .eq("is_published", true)
        .order("name");
      return data ?? [];
    },
  });

  const totalBilled = (billingItems as any[])
    .filter((i) => !["waived", "refunded"].includes(i.status))
    .reduce((s, i) => s + Number(i.amount), 0);

  const getHospitalName = (id?: string) => (hospitals as any[]).find((h) => h.id === id)?.name;
  const getDoctorName   = (id?: string) => (doctors as any[]).find((d) => d.id === id)?.name;

  // ── Proof upload ─────────────────────────────────────────────────────────

  const uploadProof = async (
    file: File,
    prefix: string,
    onDone: (path: string) => void,
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${prefix}/${caseId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("case-documents")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      onDone(path);
      toast({ title: "Proof uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from("case-documents").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  // ── Create settlement ─────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Enter a valid amount");
      const { error } = await supabase.from("settlements").insert({
        case_id: caseId,
        payee_type: form.payee_type,
        hospital_id: form.payee_type === "hospital" ? (form.hospital_id || null) : null,
        doctor_id:   form.payee_type === "doctor"   ? (form.doctor_id   || null) : null,
        amount,
        settlement_percentage: form.settlement_percentage ? parseFloat(form.settlement_percentage) : null,
        payment_method: form.payment_method || null,
        payment_reference: form.payment_reference.trim() || null,
        payment_proof_path: proofPath || null,
        notes: form.notes.trim() || null,
        created_by: user!.id,
      });
      if (error) throw error;

      const payeeName = form.payee_type === "hospital"
        ? (getHospitalName(form.hospital_id) ?? "Hospital")
        : form.payee_type === "doctor"
        ? (getDoctorName(form.doctor_id) ?? "Doctor")
        : form.payee_type;

      await addTimelineEntry(
        caseId, "settlement_created",
        `Settlement created: ₹${amount.toLocaleString("en-IN")} → ${payeeName}${form.settlement_percentage ? ` (${form.settlement_percentage}%)` : ""}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-settlements", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Settlement created" });
      setForm({ ...emptyForm, hospital_id: caseHospitalId ?? "" });
      setFormErrors({});
      setProofPath("");
      setShowForm(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Mark as paid ─────────────────────────────────────────────────────────

  const markPaidMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("settlements").update({
        status: "paid",
        settled_at: new Date().toISOString(),
        payment_method: payMethod || null,
        payment_reference: payRef.trim() || null,
        payment_proof_path: payProofPath || null,
        updated_at: new Date().toISOString(),
      }).eq("id", itemId);
      if (error) throw error;
      const mLabel = TRANSFER_MODES.find((m) => m.value === payMethod)?.label ?? payMethod;
      await addTimelineEntry(
        caseId, "settlement_paid",
        `Settlement paid via ${mLabel}${payRef ? ` (Ref: ${payRef})` : ""}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-settlements", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Settlement marked as paid" });
      resetPayPanel();
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

  const resetPayPanel = () => {
    setPayItemId(null);
    setPayMethod("bank_transfer");
    setPayRef("");
    setPayProofPath("");
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.amount || parseFloat(form.amount) <= 0) errors.amount = "Enter a valid amount";
    if (form.payee_type === "hospital" && !form.hospital_id) errors.hospital_id = "Select a hospital";
    if (form.payee_type === "doctor"   && !form.doctor_id)   errors.doctor_id   = "Select a doctor";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Totals ────────────────────────────────────────────────────────────────

  const totalPending = (settlements as any[])
    .filter((s) => ["pending","processing"].includes(s.status))
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = (settlements as any[])
    .filter((s) => s.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);

  const currentPayMode = TRANSFER_MODES.find((m) => m.value === payMethod);
  const formPayMode    = TRANSFER_MODES.find((m) => m.value === form.payment_method);

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

      {/* New settlement form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">New Settlement</h3>

          {/* Billing reference */}
          {totalBilled > 0 && (
            <div className="bg-muted/40 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Total Billing Amount</span>
              <span className="font-semibold text-foreground">₹{totalBilled.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Payee Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Payee Type <span className="text-destructive">*</span></Label>
              <Select value={form.payee_type} onValueChange={set("payee_type")}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYEE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Settlement % + auto-calculated amount */}
            <div>
              <Label className="text-xs mb-1.5 block">Settlement %</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={form.settlement_percentage}
                  onChange={(e) => set("settlement_percentage")(e.target.value)}
                  placeholder="e.g. 80"
                  className="rounded-lg text-sm pr-8"
                  min={0} max={100} step={0.5}
                />
                <Percent className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Hospital / Doctor selector */}
          {form.payee_type === "hospital" && (
            <div>
              <Label className="text-xs mb-1.5 block">Hospital <span className="text-destructive">*</span></Label>
              <Select value={form.hospital_id} onValueChange={set("hospital_id")}>
                <SelectTrigger className={`rounded-lg text-sm ${formErrors.hospital_id ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select hospital…" />
                </SelectTrigger>
                <SelectContent>
                  {(hospitals as any[]).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.hospital_id && <p className="text-[11px] text-destructive mt-1">{formErrors.hospital_id}</p>}
              {caseHospitalId && form.hospital_id === caseHospitalId && (
                <p className="text-[11px] text-muted-foreground mt-1">Auto-selected from case assignment</p>
              )}
            </div>
          )}

          {form.payee_type === "doctor" && (
            <div>
              <Label className="text-xs mb-1.5 block">Doctor <span className="text-destructive">*</span></Label>
              <Select value={form.doctor_id} onValueChange={set("doctor_id")}>
                <SelectTrigger className={`rounded-lg text-sm ${formErrors.doctor_id ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select doctor…" />
                </SelectTrigger>
                <SelectContent>
                  {(doctors as any[]).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}{d.designation ? ` — ${d.designation}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doctor_id && <p className="text-[11px] text-destructive mt-1">{formErrors.doctor_id}</p>}
            </div>
          )}

          {/* Amount */}
          <div>
            <Label className="text-xs mb-1.5 block">
              Settlement Amount (₹) <span className="text-destructive">*</span>
              {form.settlement_percentage && totalBilled > 0 && (
                <span className="text-muted-foreground font-normal ml-1">
                  — auto-calculated from {form.settlement_percentage}%
                </span>
              )}
            </Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => set("amount")(e.target.value)}
              placeholder="0"
              className={`rounded-lg text-sm ${formErrors.amount ? "border-destructive" : ""}`}
            />
            {formErrors.amount && <p className="text-[11px] text-destructive mt-1">{formErrors.amount}</p>}
          </div>

          {/* Transfer Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Mode of Transfer</Label>
              <Select value={form.payment_method} onValueChange={(v) => { set("payment_method")(v); set("payment_reference")(""); }}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRANSFER_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {formPayMode?.refLabel && (
              <div>
                <Label className="text-xs mb-1.5 block">{formPayMode.refLabel}</Label>
                <Input
                  value={form.payment_reference}
                  onChange={(e) => set("payment_reference")(e.target.value)}
                  placeholder={`Enter ${formPayMode.refLabel}`}
                  className="rounded-lg text-sm"
                />
              </div>
            )}
          </div>

          {/* Proof upload */}
          <div>
            <Label className="text-xs mb-1.5 block">Payment Proof <span className="text-muted-foreground text-[11px]">(screenshot / receipt)</span></Label>
            <input
              ref={proofRef}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadProof(f, "settlement-proofs", setProofPath, setProofUploading);
              }}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => proofRef.current?.click()} disabled={proofUploading}>
                {proofUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {proofPath ? "Re-upload" : "Upload Proof"}
              </Button>
              {proofPath && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Uploaded</span>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs mb-1.5 block">Notes <span className="text-muted-foreground text-[11px]">(optional)</span></Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              placeholder="Additional details…"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => { if (validate()) createMutation.mutate(); }} disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Settlement
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setForm({ ...emptyForm, hospital_id: caseHospitalId ?? "" }); setFormErrors({}); setProofPath(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : !readOnly ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-1"
        >
          <Plus className="h-4 w-4" /> Add settlement
        </button>
      ) : null}

      {/* Settlement list */}
      {settlements.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm py-6 text-center">No settlements yet.</p>
      ) : (
        <div className="space-y-3">
          {(settlements as any[]).map((item) => {
            const sc = STATUS_CONFIG[item.status] ?? { label: item.status, color: "bg-gray-100 text-gray-600" };
            const payeeLabel = PAYEE_TYPES.find((t) => t.value === item.payee_type)?.label ?? item.payee_type;
            const payeeName  = getHospitalName(item.hospital_id) ?? getDoctorName(item.doctor_id) ?? payeeLabel;
            const modeLabel  = TRANSFER_MODES.find((m) => m.value === item.payment_method)?.label;
            const isPayOpen  = payItemId === item.id;

            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Banknote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        {item.payee_type === "hospital" ? <Building2 className="h-3.5 w-3.5" /> : item.payee_type === "doctor" ? <UserRound className="h-3.5 w-3.5" /> : null}
                        {payeeName}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-bold text-foreground text-sm">₹{Number(item.amount).toLocaleString("en-IN")}</span>
                      {item.settlement_percentage && (
                        <span className="flex items-center gap-0.5"><Percent className="h-3 w-3" />{item.settlement_percentage}%</span>
                      )}
                      {modeLabel && <span>via {modeLabel}</span>}
                      {item.payment_reference && <span>Ref: {item.payment_reference}</span>}
                      {item.settled_at && (
                        <span className="text-emerald-600">
                          Settled {new Date(item.settled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>}
                  </div>
                  {item.payment_proof_path && (
                    <button
                      onClick={() => viewProof(item.payment_proof_path)}
                      title="View payment proof"
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Actions */}
                {["pending", "processing"].includes(item.status) && !isPayOpen && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                    {item.status === "pending" && (
                      <Button
                        size="sm" variant="outline"
                        className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                        onClick={() => statusMutation.mutate({ id: item.id, status: "processing" })}
                        disabled={statusMutation.isPending}
                      >
                        <Clock className="h-4 w-4" /> Mark Processing
                      </Button>
                    )}
                    <Button
                      size="sm" variant="outline"
                      className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => { setPayItemId(item.id); setPayMethod("bank_transfer"); setPayRef(""); setPayProofPath(""); }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5"
                      onClick={() => statusMutation.mutate({ id: item.id, status: "failed" })}
                      disabled={statusMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" /> Mark Failed
                    </Button>
                  </div>
                )}

                {/* Mark as Paid inline panel */}
                {isPayOpen && (
                  <div className="border-t border-border pt-3 space-y-3">
                    <p className="text-xs font-semibold text-foreground">Confirm Payment</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1.5 block">Mode of Transfer</Label>
                        <Select value={payMethod} onValueChange={(v) => { setPayMethod(v); setPayRef(""); }}>
                          <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TRANSFER_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {currentPayMode?.refLabel && (
                        <div>
                          <Label className="text-xs mb-1.5 block">{currentPayMode.refLabel}</Label>
                          <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder={`Enter ${currentPayMode.refLabel}`} className="rounded-lg text-sm" />
                        </div>
                      )}
                    </div>
                    {/* Pay proof */}
                    <div>
                      <Label className="text-xs mb-1.5 block">Payment Proof <span className="text-muted-foreground text-[11px]">(optional)</span></Label>
                      <input ref={payProofRef} type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProof(f, "settlement-proofs", setPayProofPath, setPayProofUploading); }} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => payProofRef.current?.click()} disabled={payProofUploading}>
                          {payProofUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {payProofPath ? "Re-upload" : "Upload Proof"}
                        </Button>
                        {payProofPath && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Uploaded</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => markPaidMutation.mutate(item.id)} disabled={markPaidMutation.isPending}>
                        {markPaidMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Confirm Paid
                      </Button>
                      <Button size="sm" variant="ghost" onClick={resetPayPanel}><XCircle className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
