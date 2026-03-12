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
import { Plus, Loader2, IndianRupee, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { addTimelineEntry } from "@/lib/caseService";

const BILLING_TYPES = [
  { value: "consultation",   label: "Consultation" },
  { value: "procedure",      label: "Procedure" },
  { value: "hospital_stay",  label: "Hospital Stay" },
  { value: "medicine",       label: "Medicine" },
  { value: "lab",            label: "Lab / Diagnostics" },
  { value: "other",          label: "Other" },
];

const PAYMENT_METHODS = [
  { value: "cash",           label: "Cash" },
  { value: "upi",            label: "UPI" },
  { value: "card",           label: "Card" },
  { value: "bank_transfer",  label: "Bank Transfer" },
  { value: "insurance",      label: "Insurance" },
  { value: "other",          label: "Other" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700" },
  invoiced:  { label: "Invoiced",  color: "bg-blue-100 text-blue-700" },
  paid:      { label: "Paid",      color: "bg-emerald-100 text-emerald-700" },
  waived:    { label: "Waived",    color: "bg-gray-100 text-gray-600" },
  refunded:  { label: "Refunded",  color: "bg-purple-100 text-purple-700" },
};

const emptyForm = {
  billing_type: "other",
  description: "",
  amount: "",
  due_date: "",
  invoice_number: "",
  notes: "",
};

interface Props { caseId: string }

export const CaseBilling = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [form, setForm] = useState(emptyForm);

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const { data: items = [] } = useQuery({
    queryKey: ["case-billing", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_billing")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      const { error } = await supabase.from("case_billing").insert({
        case_id: caseId,
        billing_type: form.billing_type,
        description: form.description,
        amount,
        due_date: form.due_date || null,
        invoice_number: form.invoice_number || null,
        notes: form.notes || null,
        created_by: user!.id,
      });
      if (error) throw error;
      await addTimelineEntry(
        caseId, "billing_added",
        `Billing item added: ${form.description} — ₹${amount.toLocaleString("en-IN")}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-billing", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Billing item added" });
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ itemId, amount }: { itemId: string; amount: number }) => {
      const { error } = await supabase
        .from("case_billing")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);
      if (error) throw error;
      await addTimelineEntry(
        caseId, "payment_received",
        `Payment received: ₹${amount.toLocaleString("en-IN")} via ${paymentMethod}`,
        user!.id,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-billing", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Payment recorded" });
      setMarkingPaid(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      const { error } = await supabase
        .from("case_billing")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-billing", caseId] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Summary totals
  const totalBilled = (items as any[]).filter((i) => !["waived", "refunded"].includes(i.status))
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = (items as any[]).filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div className="max-w-2xl space-y-4">
      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Billed", amount: totalBilled, color: "text-foreground" },
            { label: "Total Paid",   amount: totalPaid,   color: "text-emerald-600" },
            { label: "Outstanding",  amount: outstanding, color: outstanding > 0 ? "text-red-600" : "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>
                ₹{s.amount.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Add Billing Item</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Type</Label>
              <Select value={form.billing_type} onValueChange={set("billing_type")}>
                <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BILLING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
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
            <div className="col-span-2">
              <Label className="text-xs mb-1.5 block">Description *</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. IVF Procedure Package"
                className="rounded-lg text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Due Date</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                className="rounded-lg text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Invoice Number</Label>
              <Input
                value={form.invoice_number}
                onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))}
                placeholder="INV-001"
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
              disabled={!form.description || !form.amount || createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add Item
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
          <Plus className="h-4 w-4" /> Add billing item
        </button>
      )}

      {/* Billing items */}
      {items.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm py-6 text-center">No billing items yet.</p>
      ) : (
        <div className="space-y-2">
          {(items as any[]).map((item) => {
            const sc = STATUS_CONFIG[item.status] ?? { label: item.status, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-medium text-foreground">{item.description}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">₹{Number(item.amount).toLocaleString("en-IN")}</span>
                      <span>{BILLING_TYPES.find((t) => t.value === item.billing_type)?.label}</span>
                      {item.due_date && <span>Due: {new Date(item.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                      {item.invoice_number && <span>Inv: {item.invoice_number}</span>}
                      {item.payment_method && <span>via {item.payment_method}</span>}
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "pending" && (
                      <>
                        {markingPaid === item.id ? (
                          <div className="flex items-center gap-1">
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger className="h-7 text-xs w-28 rounded-md">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_METHODS.map((m) => (
                                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              onClick={() => markPaidMutation.mutate({ itemId: item.id, amount: Number(item.amount) })}
                              className="h-7 px-2 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setMarkingPaid(null)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setMarkingPaid(item.id)}
                              title="Mark as paid"
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ itemId: item.id, status: "invoiced" })}
                              title="Mark as invoiced"
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {item.status === "invoiced" && (
                      <button
                        onClick={() => setMarkingPaid(item.id)}
                        title="Mark as paid"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Paid timestamp */}
                {item.paid_at && (
                  <p className="text-xs text-emerald-600 mt-2 pl-7">
                    Paid on {new Date(item.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
