import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, ArrowRight } from "lucide-react";

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

// Case Detail view for doctors
export const DoctorCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["doctor-case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), hospitals(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes-doctor", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_notes")
        .select("*, profiles!author_id(full_name)")
        .eq("case_id", id!)
        .eq("is_internal", false)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_notes").insert({
        case_id: id!,
        author_id: user!.id,
        content: noteText,
        is_internal: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-notes-doctor", id] });
      setNoteText("");
      toast({ title: "Note added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!caseData) return <p className="text-muted-foreground">Case not found</p>;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/doctor/cases")} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">{caseData.case_number}</p>
                <h1 className="font-serif text-2xl font-bold text-foreground">{caseData.title}</h1>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLOR[caseData.status] || ""}`}>
                {caseData.status.replace("_", " ")}
              </span>
            </div>
            {caseData.description && <p className="text-muted-foreground text-sm">{caseData.description}</p>}
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div><span className="text-muted-foreground">Specialty:</span> <span className="font-medium">{caseData.specialties?.name ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Hospital:</span> <span className="font-medium">{caseData.hospitals?.name ?? "—"}</span></div>
              {caseData.estimated_cost && (
                <div><span className="text-muted-foreground">Est. Cost:</span> <span className="font-medium">₹{caseData.estimated_cost.toLocaleString("en-IN")}</span></div>
              )}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Case Notes</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {notes.map((note: any) => (
                <div key={note.id} className="p-3 rounded-lg bg-accent text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{note.profiles?.full_name ?? "Unknown"}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{note.content}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea placeholder="Add a clinical note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => addNoteMutation.mutate()} disabled={!noteText.trim() || addNoteMutation.isPending} className="gap-2">
                  <Send className="h-3.5 w-3.5" /> Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-foreground mb-3">Case Info</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted-foreground">Case #</dt><dd className="font-mono font-medium">{caseData.case_number}</dd></div>
            <div><dt className="text-muted-foreground">Priority</dt><dd className="capitalize font-medium">{caseData.priority}</dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd className="capitalize font-medium">{caseData.status.replace("_", " ")}</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd>{new Date(caseData.created_at).toLocaleDateString("en-IN")}</dd></div>
          </dl>
        </div>
      </div>
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
        .select("*, specialties(name), hospitals(name)")
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
                    {c.specialties?.name}{c.hospitals?.name ? ` • ${c.hospitals.name}` : ""}
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
