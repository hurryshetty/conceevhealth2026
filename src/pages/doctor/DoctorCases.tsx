import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Layers, UserCog, FileText, CalendarDays, StickyNote } from "lucide-react";
import { CasePatientInfo } from "@/components/case/CasePatientInfo";
import { CaseDocuments } from "@/components/case/CaseDocuments";
import { CaseAppointments } from "@/components/case/CaseAppointments";
import { CaseNotes } from "@/components/case/CaseNotes";

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  awaiting_docs: "bg-orange-100 text-orange-700",
  under_review: "bg-indigo-100 text-indigo-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

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

type DoctorTabId = "overview" | "patient_info" | "documents" | "appointments" | "notes";

const DOCTOR_TABS: { id: DoctorTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",    icon: Layers },
  { id: "patient_info", label: "Patient Info", icon: UserCog },
  { id: "documents",    label: "Documents",    icon: FileText },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "notes",        label: "Notes",        icon: StickyNote },
];

// Case Detail view for doctors
export const DoctorCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DoctorTabId>("overview");

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["doctor-case-detail", id],
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
    queryKey: ["doctor-case-lead", caseData?.lead_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("name, phone, city, procedure_interest")
        .eq("id", caseData!.lead_id)
        .maybeSingle();
      return data;
    },
    enabled: !!caseData?.lead_id,
  });

  if (isLoading) return <p className="text-muted-foreground p-6">Loading...</p>;
  if (!caseData) return <p className="text-muted-foreground p-6">Case not found</p>;

  const stageLabel = caseData.case_stage?.replace(/_/g, " ") ?? caseData.status?.replace(/_/g, " ");

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/doctor/cases")} className="gap-2 mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="mb-4">
        <p className="text-xs font-mono text-muted-foreground mb-1">{caseData.case_number}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-foreground">{caseData.title}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLOR[caseData.case_stage ?? ""] || STATUS_COLOR[caseData.status] || "bg-gray-100 text-gray-600"}`}>
            {stageLabel}
          </span>
          {caseData.priority && (
            <span className="text-xs text-muted-foreground capitalize">Priority: {caseData.priority}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {DOCTOR_TABS.map(({ id: tabId, label, icon: Icon }) => (
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

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Case Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Specialty</p><p className="font-medium">{caseData.specialties?.name ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Priority</p><p className="font-medium capitalize">{caseData.priority ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Hospital</p><p className="font-medium">{caseData.locations?.name ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground mb-0.5">Doctor</p><p className="font-medium">{caseData.doctors?.name ?? "—"}</p></div>
              {caseData.estimated_cost && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p><p className="font-medium">₹{Number(caseData.estimated_cost).toLocaleString("en-IN")}</p></div>
              )}
              {caseData.treatment_date && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Treatment Date</p><p className="font-medium">{new Date(caseData.treatment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              )}
            </div>
            {caseData.description && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{caseData.description}</p>
              </div>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 h-fit">
            <h2 className="font-semibold text-foreground mb-3">Patient / Lead</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground mb-0.5">Name</p><p className="font-medium">{leadData?.name ?? "—"}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground mb-0.5">Phone</p><p className="font-medium text-primary">{leadData?.phone ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">City</p><p className="font-medium">{leadData?.city ?? "—"}</p></div>
              </div>
              {leadData?.procedure_interest && (
                <div><p className="text-xs text-muted-foreground mb-0.5">Procedure Interest</p><p className="font-medium">{leadData.procedure_interest}</p></div>
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

      {activeTab === "notes" && (
        <CaseNotes caseId={id!} />
      )}
    </div>
  );
};

// Cases list for doctors
const DoctorCases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: doctorRecord } = useQuery({
    queryKey: ["doctor-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("id").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["doctor-cases-all", doctorRecord?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), locations(name)")
        .eq("doctor_id", doctorRecord!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!doctorRecord?.id,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-6">My Cases</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-muted-foreground p-6">Loading...</p>
        ) : !doctorRecord ? (
          <p className="text-muted-foreground p-6 text-center">No doctor profile linked. Contact admin.</p>
        ) : cases.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center">No cases assigned</p>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer"
                onClick={() => navigate(`/doctor/cases/${c.id}`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.case_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] || ""}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.specialties?.name}{c.locations?.name ? ` • ${c.locations.name}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCases;
