import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pencil, Save, X, Upload, Loader2, User, ShieldCheck, HeartPulse,
  Building2, Banknote, ClipboardCheck, CheckCircle2, Circle, ExternalLink,
} from "lucide-react";

// ─── Section field groups ────────────────────────────────────────────────────

const SECTION_FIELDS: Record<string, string[]> = {
  basic:     ["full_name","date_of_birth","age","gender","phone","email","address","city","state","emergency_contact_name","emergency_contact_number","emergency_contact_relation"],
  kyc:       ["id_proof_type","id_number","id_proof_path","patient_photo_path"],
  medical:   ["diagnosis","planned_procedure","previous_surgeries","existing_conditions","current_medications","allergies","blood_group","height_cm","weight_kg","pregnancy_status"],
  treatment: ["procedure_type","estimated_surgery_date","admission_date","room_category"],
  insurance: ["insurance_provider","policy_number","coverage_amount","payment_type","advance_paid","payment_mode"],
  consent:   ["surgery_consent","anesthesia_consent","risk_disclosure","privacy_consent","preop_tests_status","fasting_confirmation","fitness_clearance","final_doctor_approval"],
};

const CONSENT_LABELS: Record<string, string> = {
  surgery_consent:      "Surgery Consent",
  anesthesia_consent:   "Anesthesia Consent",
  risk_disclosure:      "Risk Disclosure Acknowledged",
  privacy_consent:      "Privacy Consent",
  fasting_confirmation: "Fasting Confirmation",
  fitness_clearance:    "Fitness Clearance",
  final_doctor_approval:"Final Doctor Approval",
};

// ─── Small view helpers ──────────────────────────────────────────────────────

const VField = ({ label, value }: { label: string; value?: any }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
  </div>
);

const CField = ({ label, value }: { label: string; value?: boolean }) => (
  <div className="flex items-center gap-2 py-0.5">
    {value
      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      : <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
    <span className="text-sm text-foreground">{label}</span>
  </div>
);

// ─── Section card wrapper ────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ElementType;
  title: string;
  sectionKey: string;
  editSection: string | null;
  onEdit: (k: string) => void;
  onSave: (k: string) => void;
  onCancel: (k: string) => void;
  saving: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
}

const SectionCard = ({ icon: Icon, title, sectionKey, editSection, onEdit, onSave, onCancel, saving, readOnly, children }: SectionProps) => {
  const isEditing = editSection === sectionKey;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        </div>
        {!readOnly && !isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(sectionKey)} className="h-7 gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        ) : !readOnly && isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onCancel(sectionKey)} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={() => onSave(sectionKey)} disabled={saving} className="h-7 gap-1 text-xs">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </Button>
          </div>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

interface Props { caseId: string; leadId?: string | null; leadData?: any; readOnly?: boolean }

type FormState = Record<string, any>;

export const CasePatientInfo = ({ caseId, leadId, leadData, readOnly }: Props) => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [editSection, setEditSection] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({});
  const idProofRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"id_proof" | "photo" | null>(null);

  // Fetch existing profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["patient-profile", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();
      return data;
    },
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm(profile);
    } else if (leadData) {
      // Pre-fill from lead data if no profile exists yet
      setForm({
        full_name: leadData.name ?? "",
        phone: leadData.phone ?? "",
        email: leadData.email ?? "",
        city: leadData.city ?? "",
      });
    }
  }, [profile, leadData]);

  const f = (key: string) => form[key] ?? "";
  const setF = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const cb = (key: string) => !!form[key];

  // Upsert the full form
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, case_id: caseId, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from("patient_profiles")
        .upsert(payload, { onConflict: "case_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-profile", caseId] });
      setEditSection(null);
      toast({ title: "Patient information saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleEdit = (k: string) => setEditSection(k);

  const handleSave = (_k: string) => saveMutation.mutate();

  const handleCancel = (k: string) => {
    // Reset this section's fields back to saved profile
    const fields = SECTION_FIELDS[k] ?? [];
    setForm(prev => {
      const next = { ...prev };
      fields.forEach(field => {
        next[field] = profile?.[field] ?? null;
      });
      return next;
    });
    setEditSection(null);
  };

  // File upload helpers
  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `patient-kyc/${caseId}/${prefix}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("case-documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("case-documents").createSignedUrl(path, 3600);
    return data?.signedUrl ?? "";
  };

  const handleIdProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("id_proof");
    try {
      const path = await uploadFile(file, "id_proof");
      setF("id_proof_path", path);
      toast({ title: "ID proof uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("photo");
    try {
      const path = await uploadFile(file, "photo");
      setF("patient_photo_path", path);
      toast({ title: "Photo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const openFile = async (path: string) => {
    const url = await getSignedUrl(path);
    if (url) window.open(url, "_blank");
  };

  const saving = saveMutation.isPending;

  const sProps = { editSection, onEdit: handleEdit, onSave: handleSave, onCancel: handleCancel, saving, readOnly };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── 1. Basic Details ──────────────────────────────────────────── */}
      <SectionCard icon={User} title="Basic Details" sectionKey="basic" {...sProps}>
        {editSection !== "basic" ? (
          <div className="grid grid-cols-2 gap-4">
            <VField label="Full Name" value={f("full_name")} />
            <VField label="Gender" value={f("gender") ? String(f("gender")).charAt(0).toUpperCase() + String(f("gender")).slice(1) : null} />
            <VField label="Date of Birth" value={f("date_of_birth")} />
            <VField label="Age" value={f("age")} />
            <VField label="Phone" value={f("phone")} />
            <VField label="Email" value={f("email")} />
            <div className="col-span-2"><VField label="Address" value={f("address")} /></div>
            <VField label="City" value={f("city")} />
            <VField label="State" value={f("state")} />
            <VField label="Emergency Contact Name" value={f("emergency_contact_name")} />
            <VField label="Emergency Contact Number" value={f("emergency_contact_number")} />
            <VField label="Relation with Patient" value={f("emergency_contact_relation")} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name</Label>
              <Input value={f("full_name")} onChange={e => setF("full_name", e.target.value)} placeholder="Full Name" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={f("gender")} onValueChange={v => setF("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={f("date_of_birth")} onChange={e => setF("date_of_birth", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" value={f("age")} onChange={e => setF("age", e.target.value)} placeholder="Age" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={f("phone")} onChange={e => setF("phone", e.target.value)} placeholder="+91..." />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={f("email")} onChange={e => setF("email", e.target.value)} placeholder="Email" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Textarea value={f("address")} onChange={e => setF("address", e.target.value)} rows={2} placeholder="Street address…" className="resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={f("city")} onChange={e => setF("city", e.target.value)} placeholder="City" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={f("state")} onChange={e => setF("state", e.target.value)} placeholder="State" />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Contact Name</Label>
              <Input value={f("emergency_contact_name")} onChange={e => setF("emergency_contact_name", e.target.value)} placeholder="Name" />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Contact Number</Label>
              <Input value={f("emergency_contact_number")} onChange={e => setF("emergency_contact_number", e.target.value)} placeholder="+91..." />
            </div>
            <div className="space-y-1.5">
              <Label>Relation with Patient</Label>
              <Input value={f("emergency_contact_relation")} onChange={e => setF("emergency_contact_relation", e.target.value)} placeholder="e.g. Spouse, Parent" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 2. KYC & Identity ─────────────────────────────────────────── */}
      <SectionCard icon={ShieldCheck} title="KYC & Identity" sectionKey="kyc" {...sProps}>
        {editSection !== "kyc" ? (
          <div className="grid grid-cols-2 gap-4">
            <VField label="ID Proof Type" value={f("id_proof_type")} />
            <VField label="ID Number" value={f("id_number")} />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ID Proof Document</p>
              {f("id_proof_path") ? (
                <button onClick={() => openFile(f("id_proof_path"))} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> View document
                </button>
              ) : <p className="text-sm text-muted-foreground">—</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Patient Photo</p>
              {f("patient_photo_path") ? (
                <button onClick={() => openFile(f("patient_photo_path"))} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> View photo
                </button>
              ) : <p className="text-sm text-muted-foreground">—</p>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ID Proof Type</Label>
              <Select value={f("id_proof_type")} onValueChange={v => setF("id_proof_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["Aadhaar Card","PAN Card","Passport","Voter ID","Driving Licence","Other"].map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>ID Number</Label>
              <Input value={f("id_number")} onChange={e => setF("id_number", e.target.value)} placeholder="ID number" />
            </div>
            <div className="space-y-1.5">
              <Label>Upload ID Proof</Label>
              <input type="file" ref={idProofRef} className="hidden" accept="image/*,application/pdf" onChange={handleIdProofUpload} />
              <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => idProofRef.current?.click()} disabled={uploading === "id_proof"}>
                {uploading === "id_proof" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {f("id_proof_path") ? "Replace document" : "Upload document"}
              </Button>
              {f("id_proof_path") && (
                <button onClick={() => openFile(f("id_proof_path"))} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <ExternalLink className="h-3 w-3" /> View current
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Upload Patient Photo</Label>
              <input type="file" ref={photoRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => photoRef.current?.click()} disabled={uploading === "photo"}>
                {uploading === "photo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {f("patient_photo_path") ? "Replace photo" : "Upload photo"}
              </Button>
              {f("patient_photo_path") && (
                <button onClick={() => openFile(f("patient_photo_path"))} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <ExternalLink className="h-3 w-3" /> View current
                </button>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 3. Medical Details ────────────────────────────────────────── */}
      <SectionCard icon={HeartPulse} title="Medical Details" sectionKey="medical" {...sProps}>
        {editSection !== "medical" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><VField label="Diagnosis / Medical Condition" value={f("diagnosis")} /></div>
            <div className="col-span-2"><VField label="Planned Procedure / Surgery" value={f("planned_procedure")} /></div>
            <VField label="Blood Group" value={f("blood_group")} />
            <VField label="Pregnancy Status" value={f("pregnancy_status")} />
            <VField label="Height (cm)" value={f("height_cm")} />
            <VField label="Weight (kg)" value={f("weight_kg")} />
            <div className="col-span-2"><VField label="Previous Surgeries" value={f("previous_surgeries")} /></div>
            <div className="col-span-2"><VField label="Existing Medical Conditions" value={f("existing_conditions")} /></div>
            <div className="col-span-2"><VField label="Current Medications" value={f("current_medications")} /></div>
            <div className="col-span-2"><VField label="Allergies" value={f("allergies")} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Diagnosis / Medical Condition</Label>
              <Textarea value={f("diagnosis")} onChange={e => setF("diagnosis", e.target.value)} rows={2} placeholder="Primary diagnosis…" className="resize-none" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Planned Procedure / Surgery</Label>
              <Input value={f("planned_procedure")} onChange={e => setF("planned_procedure", e.target.value)} placeholder="e.g. IVF, Knee Replacement…" />
            </div>
            <div className="space-y-1.5">
              <Label>Blood Group</Label>
              <Select value={f("blood_group")} onValueChange={v => setF("blood_group", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pregnancy Status</Label>
              <Select value={f("pregnancy_status")} onValueChange={v => setF("pregnancy_status", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                  <SelectItem value="pregnant">Pregnant</SelectItem>
                  <SelectItem value="possibly_pregnant">Possibly Pregnant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input type="number" value={f("height_cm")} onChange={e => setF("height_cm", e.target.value)} placeholder="e.g. 165" />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" value={f("weight_kg")} onChange={e => setF("weight_kg", e.target.value)} placeholder="e.g. 70" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Previous Surgeries</Label>
              <Textarea value={f("previous_surgeries")} onChange={e => setF("previous_surgeries", e.target.value)} rows={2} placeholder="List any previous surgeries…" className="resize-none" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Existing Medical Conditions</Label>
              <Textarea value={f("existing_conditions")} onChange={e => setF("existing_conditions", e.target.value)} rows={2} placeholder="e.g. Diabetes, Hypertension…" className="resize-none" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Current Medications</Label>
              <Textarea value={f("current_medications")} onChange={e => setF("current_medications", e.target.value)} rows={2} placeholder="List current medications and dosages…" className="resize-none" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Allergies</Label>
              <Input value={f("allergies")} onChange={e => setF("allergies", e.target.value)} placeholder="e.g. Penicillin, Latex, None known…" />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 4. Treatment & Hospital ───────────────────────────────────── */}
      <SectionCard icon={Building2} title="Treatment & Hospital Details" sectionKey="treatment" {...sProps}>
        {editSection !== "treatment" ? (
          <div className="grid grid-cols-2 gap-4">
            <VField label="Procedure Type" value={f("procedure_type")} />
            <VField label="Room Category" value={f("room_category")} />
            <VField label="Estimated Surgery Date" value={f("estimated_surgery_date")} />
            <VField label="Admission Date" value={f("admission_date")} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Procedure Type</Label>
              <Input value={f("procedure_type")} onChange={e => setF("procedure_type", e.target.value)} placeholder="e.g. Laparoscopic, Open, Robotic…" />
            </div>
            <div className="space-y-1.5">
              <Label>Room Category</Label>
              <Select value={f("room_category")} onValueChange={v => setF("room_category", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Ward</SelectItem>
                  <SelectItem value="semi_private">Semi-Private</SelectItem>
                  <SelectItem value="private">Private Room</SelectItem>
                  <SelectItem value="deluxe">Deluxe Room</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Surgery Date</Label>
              <Input type="date" value={f("estimated_surgery_date")} onChange={e => setF("estimated_surgery_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Admission Date</Label>
              <Input type="date" value={f("admission_date")} onChange={e => setF("admission_date", e.target.value)} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 5. Insurance & Payment ────────────────────────────────────── */}
      <SectionCard icon={Banknote} title="Insurance & Payment" sectionKey="insurance" {...sProps}>
        {editSection !== "insurance" ? (
          <div className="grid grid-cols-2 gap-4">
            <VField label="Insurance Provider" value={f("insurance_provider")} />
            <VField label="Policy Number" value={f("policy_number")} />
            <VField label="Coverage Amount" value={f("coverage_amount") ? `₹${Number(f("coverage_amount")).toLocaleString("en-IN")}` : null} />
            <VField label="Payment Type" value={f("payment_type") ? { cashless: "Cashless", reimbursement: "Reimbursement", self_pay: "Self Pay" }[f("payment_type") as string] ?? f("payment_type") : null} />
            <VField label="Advance Paid" value={f("advance_paid") ? `₹${Number(f("advance_paid")).toLocaleString("en-IN")}` : null} />
            <VField label="Payment Mode" value={f("payment_mode")} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Insurance Provider</Label>
              <Input value={f("insurance_provider")} onChange={e => setF("insurance_provider", e.target.value)} placeholder="e.g. Star Health, LIC…" />
            </div>
            <div className="space-y-1.5">
              <Label>Policy Number</Label>
              <Input value={f("policy_number")} onChange={e => setF("policy_number", e.target.value)} placeholder="Policy #" />
            </div>
            <div className="space-y-1.5">
              <Label>Coverage Amount (₹)</Label>
              <Input type="number" value={f("coverage_amount")} onChange={e => setF("coverage_amount", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Type</Label>
              <Select value={f("payment_type")} onValueChange={v => setF("payment_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashless">Cashless</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  <SelectItem value="self_pay">Self Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Advance Paid (₹)</Label>
              <Input type="number" value={f("advance_paid")} onChange={e => setF("advance_paid", e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={f("payment_mode")} onValueChange={v => setF("payment_mode", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="insurance">Insurance Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 6. Consent & Pre-Surgery ──────────────────────────────────── */}
      <SectionCard icon={ClipboardCheck} title="Consent & Pre-Surgery" sectionKey="consent" {...sProps}>
        {editSection !== "consent" ? (
          <div className="space-y-1">
            {Object.entries(CONSENT_LABELS).map(([key, label]) => (
              <CField key={key} label={label} value={cb(key)} />
            ))}
            <div className="pt-2">
              <VField label="Pre-op Tests Status" value={f("preop_tests_status") ? { pending: "Pending", in_progress: "In Progress", completed: "Completed", not_applicable: "Not Applicable" }[f("preop_tests_status") as string] ?? f("preop_tests_status") : null} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(CONSENT_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cb(key)}
                  onChange={e => setF(key, e.target.checked)}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
            <div className="pt-2 space-y-1.5">
              <Label>Pre-op Tests Status</Label>
              <Select value={f("preop_tests_status")} onValueChange={v => setF("preop_tests_status", v)}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};
