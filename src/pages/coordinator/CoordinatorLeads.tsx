import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search, Pencil, UserCheck, Phone, Mail, MapPin, Calendar,
  AlertCircle, Building2, Stethoscope, Briefcase, Users,
  X, FolderPlus, FolderOpen,
} from "lucide-react";
import { convertLeadToCase, type LeadForConversion } from "@/lib/caseService";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LeadType = "patient_enquiry" | "doctor_enquiry" | "hospital_enquiry" | "career_enquiry";
type CRMStatus = "new" | "contacted" | "follow_up" | "interested" | "not_interested" | "converted" | "closed";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface LinkedCase {
  id: string;
  case_code: string | null;
  case_stage: string | null;
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  source_page?: string;
  procedure_interest?: string;
  lead_type: LeadType;
  crm_status: CRMStatus;
  priority?: Priority;
  notes?: string;
  follow_up_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  linked_case?: LinkedCase | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const LEAD_TYPES: { value: LeadType | "all"; label: string; icon: React.ElementType; color: string }[] = [
  { value: "all",              label: "All Leads",          icon: Users,       color: "text-foreground" },
  { value: "patient_enquiry",  label: "Patient Enquiries",  icon: Stethoscope, color: "text-blue-600" },
  { value: "doctor_enquiry",   label: "Doctor Enquiries",   icon: UserCheck,   color: "text-violet-600" },
  { value: "hospital_enquiry", label: "Hospital Enquiries", icon: Building2,   color: "text-teal-600" },
  { value: "career_enquiry",   label: "Careers",            icon: Briefcase,   color: "text-amber-600" },
];

const CRM_STATUSES: { value: CRMStatus; label: string; color: string }[] = [
  { value: "new",            label: "New",                 color: "bg-blue-100 text-blue-700" },
  { value: "contacted",      label: "Contacted",           color: "bg-purple-100 text-purple-700" },
  { value: "follow_up",      label: "Follow-up Scheduled", color: "bg-yellow-100 text-yellow-700" },
  { value: "interested",     label: "Interested",          color: "bg-green-100 text-green-700" },
  { value: "not_interested", label: "Not Interested",      color: "bg-gray-100 text-gray-600" },
  { value: "converted",      label: "Converted to Case",   color: "bg-emerald-100 text-emerald-700" },
  { value: "closed",         label: "Closed / Lost",       color: "bg-red-100 text-red-700" },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "HIGH",     label: "High",     color: "bg-red-100 text-red-700" },
  { value: "MEDIUM",   label: "Medium",   color: "bg-yellow-100 text-yellow-700" },
  { value: "LOW",      label: "Low",      color: "bg-gray-100 text-gray-600" },
  { value: "CRITICAL", label: "Critical", color: "bg-rose-200 text-rose-800 font-bold" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: CRMStatus) {
  const s = CRM_STATUSES.find((s) => s.value === status);
  return s ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.color}`}>
      {s.label}
    </span>
  ) : null;
}

function inferLeadType(lead: any): LeadType {
  const src = (lead.source_page || "").toLowerCase();
  if (src === "doctor-partnership") return "doctor_enquiry";
  if (src === "hospital-partnership") return "hospital_enquiry";
  if (src === "careers") return "career_enquiry";
  return "patient_enquiry";
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────

const LeadEditModal = ({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    crm_status: lead.crm_status,
    notes: lead.notes ?? "",
    follow_up_date: lead.follow_up_date ?? "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("leads")
        .update({
          crm_status: form.crm_status,
          notes: form.notes || null,
          follow_up_date: form.follow_up_date || null,
        })
        .eq("id", lead.id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Lead updated" }); onSaved(); onClose(); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Update Lead — {lead.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/50 rounded-xl text-sm mb-2">
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone}</a>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {lead.city}
            </div>
          )}
          {lead.procedure_interest && (
            <div className="col-span-2 text-muted-foreground border-t border-border pt-2 mt-1 text-xs leading-relaxed">
              {lead.procedure_interest}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Status</Label>
            <Select value={form.crm_status} onValueChange={(v) => setForm((p) => ({ ...p, crm_status: v as CRMStatus }))}>
              <SelectTrigger className="rounded-lg text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CRM_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Next Follow-up Date</Label>
            <Input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((p) => ({ ...p, follow_up_date: e.target.value }))}
              className="rounded-lg text-sm"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Notes</Label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Follow-up notes, patient preferences…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const CoordinatorLeads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<LeadType | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CRMStatus | "all">("all");
  const [cityFilter, setCityFilter] = useState("");
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: ["coordinator-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, patient_cases!lead_id(id, case_code, case_stage)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((l) => ({
        ...l,
        lead_type: l.lead_type || inferLeadType(l),
        crm_status: l.crm_status || "new",
        priority: l.priority || "MEDIUM",
        linked_case: (l.patient_cases as LinkedCase[])?.[0] ?? null,
      })) as Lead[];
    },
  });

  const handleConvertToCase = async (lead: Lead) => {
    setConvertingId(lead.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const leadForConversion: LeadForConversion = {
        id: lead.id, name: lead.name, phone: lead.phone,
        email: lead.email, city: lead.city, procedure_interest: lead.procedure_interest,
      };
      const { caseCode, caseId } = await convertLeadToCase(leadForConversion, session.user.id);
      qc.invalidateQueries({ queryKey: ["coordinator-leads"] });
      toast({
        title: "Case created",
        description: `${caseCode} has been created for ${lead.name}.`,
      });
      navigate(`/coordinator/cases/${caseId}`);
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally {
      setConvertingId(null);
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: rawLeads.length };
    for (const t of LEAD_TYPES.filter((t) => t.value !== "all")) {
      map[t.value] = rawLeads.filter((l) => l.lead_type === t.value).length;
    }
    return map;
  }, [rawLeads]);

  const filtered = useMemo(() => {
    return rawLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchTab = activeTab === "all" || l.lead_type === activeTab;
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        (l.phone || "").includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.city || "").toLowerCase().includes(q) ||
        (l.procedure_interest || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || l.crm_status === statusFilter;
      const matchCity = !cityFilter || (l.city || "").toLowerCase().includes(cityFilter.toLowerCase());
      return matchTab && matchSearch && matchStatus && matchCity;
    });
  }, [rawLeads, activeTab, search, statusFilter, cityFilter]);

  const hasFilters = statusFilter !== "all" || cityFilter;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{rawLeads.length} total enquiries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 border-b border-border pb-0">
        {LEAD_TYPES.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.value] ?? 0;
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as LeadType | "all")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-primary" : tab.color}`} />
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CRMStatus | "all")}>
          <SelectTrigger className="w-[190px] rounded-lg">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {CRM_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by city…"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-[150px] rounded-lg"
        />
        {hasFilters && (
          <button
            onClick={() => { setStatusFilter("all"); setCityFilter(""); }}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline whitespace-nowrap"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> lead{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== rawLeads.length && ` (filtered from ${rawLeads.length})`}
      </p>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">City</TableHead>
                <TableHead className="font-semibold">Enquiry / Interest</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Follow-up</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="w-[90px] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    Loading leads…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No leads found.</p>
                    {hasFilters && (
                      <button
                        onClick={() => { setStatusFilter("all"); setCityFilter(""); }}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Clear filters
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((lead) => {
                const overdue = isOverdue(lead.follow_up_date) && !["converted", "closed", "not_interested"].includes(lead.crm_status);
                return (
                  <TableRow key={lead.id} className="hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <span className="font-medium text-sm text-foreground">{lead.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate max-w-[160px]">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.city || <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lead.procedure_interest || <span className="text-muted-foreground/40">—</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {statusBadge(lead.crm_status)}
                        {lead.crm_status === "converted" && lead.linked_case?.case_code && (
                          <span className="text-[10px] font-mono text-emerald-600 block leading-none">
                            {lead.linked_case.case_code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.follow_up_date ? (
                        <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                          {overdue && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                          <Calendar className="h-3 w-3 shrink-0" />
                          {new Date(lead.follow_up_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View linked case */}
                        {lead.crm_status === "converted" && lead.linked_case && (
                          <button
                            onClick={() => navigate(`/coordinator/cases/${lead.linked_case!.id}`)}
                            title={`View case ${lead.linked_case.case_code ?? ""}`}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {/* Convert to Case */}
                        {lead.lead_type === "patient_enquiry" && lead.crm_status !== "converted" && (
                          <button
                            onClick={() => handleConvertToCase(lead)}
                            disabled={convertingId === lead.id}
                            title="Convert to Case"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => setEditLead(lead)}
                          title="View / Edit"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {editLead && (
        <LeadEditModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["coordinator-leads"] })}
        />
      )}
    </div>
  );
};

export default CoordinatorLeads;
