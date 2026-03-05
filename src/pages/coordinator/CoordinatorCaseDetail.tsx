import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Lock } from "lucide-react";

const STATUSES = ["new","assigned","in_progress","awaiting_docs","under_review","approved","rejected","completed","cancelled"];

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

const CoordinatorCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["case-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_cases")
        .select("*, specialties(name), hospitals(name, city), doctors(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_notes")
        .select("*, profiles!author_id(full_name)")
        .eq("case_id", id!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals-list"],
    queryFn: async () => {
      const { data } = await supabase.from("hospitals").select("id, name, city").eq("is_active", true);
      return data ?? [];
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("id, name, specialty").eq("is_active", true);
      return data ?? [];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("case_notes").insert({
        case_id: id!,
        author_id: user!.id,
        content: noteText,
        is_internal: isInternal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-notes", id] });
      setNoteText("");
      toast({ title: "Note added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from("patient_cases").update(updates).eq("id", id!);
      if (error) throw error;
      if (updates.status) {
        await supabase.from("case_status_history").insert({
          case_id: id!,
          status: updates.status,
          changed_by: user!.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-detail", id] });
      toast({ title: "Case updated" });
      setNewStatus("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!caseData) return <p className="text-muted-foreground">Case not found</p>;

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate("/coordinator/cases")} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Cases
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Case Info */}
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
            {caseData.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{caseData.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div><span className="text-muted-foreground">Specialty:</span> <span className="font-medium">{caseData.specialties?.name ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{caseData.priority}</span></div>
              <div><span className="text-muted-foreground">Hospital:</span> <span className="font-medium">{caseData.hospitals?.name ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Doctor:</span> <span className="font-medium">{caseData.doctors?.name ?? "—"}</span></div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Notes & Updates</h2>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No notes yet</p>
              ) : (
                notes.map((note: any) => (
                  <div key={note.id} className={`p-3 rounded-lg text-sm ${note.is_internal ? "bg-yellow-50 border border-yellow-200" : "bg-accent"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{note.profiles?.full_name ?? "Unknown"}</span>
                      {note.is_internal && <Lock className="h-3 w-3 text-yellow-600" />}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{note.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
                  Internal note (not visible to patient)
                </label>
                <Button
                  size="sm"
                  onClick={() => addNoteMutation.mutate()}
                  disabled={!noteText.trim() || addNoteMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="space-y-5">
          {/* Update Status */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Update Status</h3>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue placeholder="Change status..." /></SelectTrigger>
              <SelectContent>
                {STATUSES.filter((s) => s !== caseData.status).map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full mt-3"
              disabled={!newStatus || updateMutation.isPending}
              onClick={() => updateMutation.mutate({ status: newStatus })}
            >
              Update Status
            </Button>
          </div>

          {/* Assign Hospital */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Assign Hospital</h3>
            <Select
              value={caseData.hospital_id ?? ""}
              onValueChange={(v) => updateMutation.mutate({ hospital_id: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select hospital..." /></SelectTrigger>
              <SelectContent>
                {hospitals.map((h: any) => (
                  <SelectItem key={h.id} value={h.id}>{h.name} — {h.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign Doctor */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Assign Doctor</h3>
            <Select
              value={caseData.doctor_id ?? ""}
              onValueChange={(v) => updateMutation.mutate({ doctor_id: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select doctor..." /></SelectTrigger>
              <SelectContent>
                {doctors.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Cost */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Estimated Cost (INR)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                defaultValue={caseData.estimated_cost ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) updateMutation.mutate({ estimated_cost: val });
                }}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorCaseDetail;
