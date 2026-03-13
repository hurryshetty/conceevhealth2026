import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download, Eye, CheckCircle2, Clock, Trash2, Loader2 } from "lucide-react";
import { addTimelineEntry } from "@/lib/caseService";

const DOC_TYPES = [
  { value: "medical_report",    label: "Medical Report" },
  { value: "lab_report",        label: "Lab Report" },
  { value: "prescription",      label: "Prescription" },
  { value: "insurance",         label: "Insurance" },
  { value: "id_proof",          label: "ID Proof" },
  { value: "consent_form",      label: "Consent Form" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "invoice",           label: "Invoice" },
  { value: "other",             label: "Other" },
];

const DOC_TYPE_COLOR: Record<string, string> = {
  medical_report:    "bg-blue-100 text-blue-700",
  lab_report:        "bg-purple-100 text-purple-700",
  prescription:      "bg-green-100 text-green-700",
  insurance:         "bg-teal-100 text-teal-700",
  id_proof:          "bg-yellow-100 text-yellow-700",
  consent_form:      "bg-indigo-100 text-indigo-700",
  discharge_summary: "bg-emerald-100 text-emerald-700",
  invoice:           "bg-orange-100 text-orange-700",
  other:             "bg-gray-100 text-gray-600",
};

interface Props { caseId: string }

export const CaseDocuments = ({ caseId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState("other");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: documents = [] } = useQuery({
    queryKey: ["case-documents", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_documents")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("case_documents")
        .update({ is_verified: true, verified_by: user!.id, verified_at: new Date().toISOString() })
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-documents", caseId] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ docId, filePath }: { docId: string; filePath: string }) => {
      await supabase.storage.from("case-documents").remove([filePath]);
      const { error } = await supabase.from("case_documents").delete().eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-documents", caseId] });
      toast({ title: "Document deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${caseId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("case-documents")
        .upload(filePath, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from("case_documents").insert({
        case_id: caseId,
        uploaded_by: user!.id,
        document_type: docType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        notes: notes || null,
      });
      if (insertErr) {
        await supabase.storage.from("case-documents").remove([filePath]);
        throw insertErr;
      }

      await addTimelineEntry(
        caseId, "document_uploaded",
        `Document uploaded: ${file.name} (${DOC_TYPES.find((d) => d.value === docType)?.label})`,
        user!.id,
      );

      qc.invalidateQueries({ queryKey: ["case-documents", caseId] });
      qc.invalidateQueries({ queryKey: ["case-timeline", caseId] });
      toast({ title: "Document uploaded" });
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("case-documents")
      .createSignedUrl(filePath, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data } = await supabase.storage
      .from("case-documents")
      .createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = fileName;
      a.click();
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Upload form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Upload Document</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Blood test results"
              className="rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <Button
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Choose & Upload"}
          </Button>
          <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, XLS up to 10 MB</p>
        </div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <p className="text-muted-foreground text-sm py-6 text-center">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {(documents as any[]).map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DOC_TYPE_COLOR[doc.document_type] ?? ""}`}>
                    {DOC_TYPES.find((d) => d.value === doc.document_type)?.label ?? doc.document_type}
                  </span>
                  {doc.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.file_size)}{doc.file_size ? " • " : ""}
                  {new Date(doc.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {doc.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{doc.notes}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleView(doc.file_path)}
                  title="View"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDownload(doc.file_path, doc.file_name)}
                  title="Download"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                {!doc.is_verified && (
                  <button
                    onClick={() => verifyMutation.mutate(doc.id)}
                    title="Mark as verified"
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Delete this document?")) {
                      deleteMutation.mutate({ docId: doc.id, filePath: doc.file_path });
                    }
                  }}
                  title="Delete"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
