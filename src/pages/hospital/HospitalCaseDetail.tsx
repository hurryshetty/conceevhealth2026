import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers, UserCog, FileText, CalendarDays, IndianRupee, Banknote, StickyNote } from "lucide-react";
import { CasePatientInfo } from "@/components/case/CasePatientInfo";
import { CaseDocuments } from "@/components/case/CaseDocuments";
import { CaseAppointments } from "@/components/case/CaseAppointments";
import { CaseBilling } from "@/components/case/CaseBilling";
import { CaseSettlements } from "@/components/case/CaseSettlements";
import { CaseNotes } from "@/components/case/CaseNotes";

type TabId = "overview" | "patient_info" | "documents" | "appointments" | "billing" | "settlements" | "notes";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",     icon: Layers },
  { id: "patient_info", label: "Patient Info",  icon: UserCog },
  { id: "documents",    label: "Documents",     icon: FileText },
  { id: "appointments", label: "Appointments",  icon: CalendarDays },
  { id: "billing",      label: "Billing",       icon: IndianRupee },
  { id: "settlements",  label: "Settlements",   icon: Banknote },
  { id: "notes",        label: "Notes",         icon: StickyNote },
];

const STAGE_COLOR: Record<string, string> = {
  case_created: "bg-blue-100 text-blue-700",
  assignment_pending: "bg-orange-100 text-orange-700",
  assigned: "bg-purple-100 text-purple-700",
  consultation_scheduled: "bg-indigo-100 text-indigo-700",
  consultation_completed: "bg-cyan-100 text-cyan-700",
  pre_treatment: "bg-yellow-100 text-yellow-700",
  treatment_confirmed: "bg-lime-100 text-lime-700",
  admitted: "bg-teal-100 text-teal-700",
  treatment_in_progress: "bg-emerald-100 text-emerald-700",
  recovery: "bg-green-100 text-green-700",
  discharged: "bg-green-200 text-green-800",
  followup: "bg-sky-100 text-sky-700",
  billing_pending: "bg-amber-100 text-amber-700",
  closed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  on_hold: "bg-zinc-100 text-zinc-700",
  escalated: "bg-rose-100 text-rose-700",
};

const HospitalCaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["hospital-case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), locations(name), doctors(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: leadData } = useQuery({
    queryKey: ["hospital-case-lead", caseData?.lead_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("full_name, phone, city, interest")
        .eq("id", caseData!.lead_id)
        .maybeSingle();
      return data;
    },
    enabled: !!caseData?.lead_id,
  });

  if (isLoading) return <p className="text-muted-foreground p-6">Loading...</p>;
  if (!caseData) return <p className="text-muted-foreground p-6">Case not found.</p>;

  const stageLabel = caseData.case_stage?.replace(/_/g, " ") ?? caseData.status?.replace(/_/g, " ");

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/hospital/cases")} className="gap-2 mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Cases
      </Button>

      <div className="mb-4">
        <p className="text-xs font-mono text-muted-foreground mb-1">{caseData.case_number}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-foreground">{caseData.title}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLOR[caseData.case_stage ?? ""] || "bg-gray-100 text-gray-600"}`}>
            {stageLabel}
          </span>
          {caseData.priority && (
            <span className="text-xs text-muted-foreground capitalize">Priority: {caseData.priority}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              activeTab === tabId
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Case Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Specialty</p><p className="font-medium">{caseData.specialties?.name ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Priority</p><p className="font-medium capitalize">{caseData.priority ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Hospital</p><p className="font-medium">{caseData.locations?.name ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Doctor</p><p className="font-medium">{caseData.doctors?.name ? `Dr. ${caseData.doctors.name}` : "—"}</p></div>
              {caseData.estimated_cost && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p><p className="font-medium">₹{Number(caseData.estimated_cost).toLocaleString("en-IN")}</p></div>
              )}
              {caseData.treatment_date && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Treatment Date</p><p className="font-medium">{new Date(caseData.treatment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              )}
              <div><p className="text-xs text-muted-foreground mb-0.5">Consultation</p><p className="font-medium capitalize">{caseData.consultation_status ?? "Pending"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Payment</p><p className="font-medium capitalize">{caseData.payment_status ?? "Pending"}</p></div>
            </div>
            {caseData.description && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{caseData.description}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">
              Created: {new Date(caseData.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 h-fit">
            <h2 className="font-semibold text-foreground mb-3">Patient / Lead</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Name</p><p className="font-medium">{leadData?.full_name ?? "—"}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground mb-0.5">Phone</p><p className="font-medium text-primary">{leadData?.phone ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">City</p><p className="font-medium">{leadData?.city ?? "—"}</p></div>
              </div>
              {leadData?.interest && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Procedure Interest</p><p className="font-medium">{leadData.interest}</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "patient_info" && (
        <CasePatientInfo caseId={id!} leadId={caseData.lead_id} leadData={leadData} readOnly />
      )}

      {activeTab === "documents" && (
        <CaseDocuments caseId={id!} readOnly />
      )}

      {activeTab === "appointments" && (
        <CaseAppointments caseId={id!} />
      )}

      {activeTab === "billing" && (
        <CaseBilling caseId={id!} />
      )}

      {activeTab === "settlements" && (
        <CaseSettlements caseId={id!} caseHospitalId={caseData.hospital_id} readOnly />
      )}

      {activeTab === "notes" && (
        <CaseNotes caseId={id!} />
      )}
    </div>
  );
};

export default HospitalCaseDetail;
