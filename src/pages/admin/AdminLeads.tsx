import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Trash2, Eye, Pencil, StickyNote, UserCheck,
  Phone, Mail, MapPin, Calendar, Clock, AlertCircle,
  Building2, Stethoscope, Briefcase, Users, ChevronDown,
  X, CheckCircle2, FolderPlus,
} from "lucide-react";
import { convertLeadToCase, type LeadForConversion } from "@/lib/caseService";

// ─── Types ───────────────────────────────────────────────────────────────────

type LeadType = "patient_enquiry" | "doctor_enquiry" | "hospital_enquiry" | "career_enquiry";
type CRMStatus = "new" | "contacted" | "follow_up" | "interested" | "not_interested" | "converted" | "closed";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

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
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LEAD_TYPES: { value: LeadType | "all"; label: string; icon: React.ElementType; color: string }[] = [
  { value: "all",               label: "All Leads",         icon: Users,        color: "text-foreground" },
  { value: "patient_enquiry",   label: "Patient Enquiries", icon: Stethoscope,  color: "text-blue-600" },
  { value: "doctor_enquiry",    label: "Doctor Enquiries",  icon: UserCheck,    color: "text-violet-600" },
  { value: "hospital_enquiry",  label: "Hospital Enquiries",icon: Building2,    color: "text-teal-600" },
  { value: "career_enquiry",    label: "Careers",           icon: Briefcase,    color: "text-amber-600" },
];

const CRM_STATUSES: { value: CRMStatus; label: string; color: string }[] = [
  { value: "new",            label: "New",                 color: "bg-blue-100 text-blue-700" },
  { value: "contacted",      label: "Contacted",           color: "bg-purple-100 text-purple-700" },
  { value: "follow_up",      label: "Follow-up Scheduled", color: "bg-yellow-100 text-yellow-700" },
  { value: "interested",     label: "Interested",          color: "bg-green-100 text-green-700" },
  { value: "not_interested", label: "Not Interested",      color: "bg-gray-100 text-gray-600" },
  { value: "converted",      label: "Converted",           color: "bg-emerald-100 text-emerald-700" },
  { value: "closed",         label: "Closed",              color: "bg-red-100 text-red-700" },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "HIGH",     label: "High",     color: "bg-red-100 text-red-700" },
  { value: "MEDIUM",   label: "Medium",   color: "bg-yellow-100 text-yellow-700" },
  { value: "LOW",      label: "Low",      color: "bg-gray-100 text-gray-600" },
  { value: "CRITICAL", label: "Critical", color: "bg-rose-200 text-rose-800 font-bold" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: CRMStatus) {
  const s = CRM_STATUSES.find((s) => s.value === status);
  return s ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.color}`}>
      {s.label}
    </span>
  ) : null;
}

function priorityBadge(priority?: Priority) {
  if (!priority) return null;
  const p = PRIORITIES.find((p) => p.value === priority);
  return p ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${p.color}`}>
      {p.label}
    </span>
  ) : null;
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function leadTypeIcon(type: LeadType) {
  const t = LEAD_TYPES.find((t) => t.value === type);
  if (!t || t.value === "all") return null;
  const Icon = t.icon;
  return <Icon className={`h-3.5 w-3.5 ${t.color} shrink-0`} />;
}

/** Derive lead_type from source_page when not explicitly set */
function inferLeadType(lead: any): LeadType {
  const src = (lead.source_page || "").toLowerCase();
  if (src === "doctor-partnership") return "doctor_enquiry";
  if (src === "hospital-partnership") return "hospital_enquiry";
  if (src === "careers") return "career_enquiry";
  return "patient_enquiry";
}

// ─── Lead Edit / Detail Modal ─────────────────────────────────────────────────

interface EditModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}

const LeadEditModal = ({ lead, onClose, onSaved }: EditModalProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    crm_status: lead?.crm_status ?? "new",
    priority: (lead?.priority ?? "MEDIUM") as Priority,
    assigned_to: lead?.assigned_to ?? "",
    notes: lead?.notes ?? "",
    follow_up_date: lead?.follow_up_date ?? "",
    lead_type: (lead?.lead_type ?? "patient_enquiry") as LeadType,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("leads")
        .update({
          crm_status: form.crm_status,
          priority: form.priority,
          assigned_to: form.assigned_to || null,
          notes: form.notes || null,
          follow_up_date: form.follow_up_date || null,
          lead_type: form.lead_type,
        })
        .eq("id", lead!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Lead updated" });
      onSaved();
      onClose();
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!lead) return null;

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Lead Details — {lead.name}</DialogTitle>
        </DialogHeader>

        {/* Lead info summary */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/50 rounded-xl text-sm">
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-primary">{lead.phone}</a>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <a href={`mailto:${lead.email}`} className="hover:text-primary truncate">{lead.email}</a>
            </div>
          )}
          {lead.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {lead.city}
            </div>
          )}
          {lead.source_page && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{lead.source_page}</span>
            </div>
          )}
          {lead.procedure_interest && (
            <div className="col-span-2 text-muted-foreground border-t border-border pt-3 mt-1">
              <p className="text-xs font-semibold text-foreground mb-1">Enquiry / Interest</p>
              <p className="text-xs leading-relaxed break-words">{lead.procedure_interest}</p>
            </div>
          )}
          <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <Calendar className="h-3.5 w-3.5" />
            Submitted: {new Date(lead.created_at).toLocaleString()}
          </div>
        </div>

        {/* CRM fields */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Lead Type</Label>
            <Select value={form.lead_type} onValueChange={set("lead_type")}>
              <SelectTrigger className="rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_TYPES.filter((t) => t.value !== "all").map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Status</Label>
            <Select value={form.crm_status} onValueChange={set("crm_status")}>
              <SelectTrigger className="rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRM_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Priority</Label>
            <Select value={form.priority} onValueChange={set("priority")}>
              <SelectTrigger className="rounded-lg text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Assigned To</Label>
            <Input
              placeholder="Team member name"
              value={form.assigned_to}
              onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}
              className="rounded-lg text-sm"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-semibold mb-1.5 block">Next Follow-up Date</Label>
            <Input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((p) => ({ ...p, follow_up_date: e.target.value }))}
              className="rounded-lg text-sm"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-semibold mb-1.5 block">Notes</Label>
            <textarea
              rows={4}
              placeholder="Discussion summary, follow-up remarks, patient preferences, treatment urgency…"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="gap-2"
          >
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminLeads = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Filters
  const [activeTab, setActiveTab] = useState<LeadType | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CRMStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [cityFilter, setCityFilter] = useState("");
  const [editLead, setEditLead] = useState<Lead | null>(null);

  // Fetch all leads
  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Backfill lead_type if not set
      return (data as any[]).map((l) => ({
        ...l,
        lead_type: l.lead_type || inferLeadType(l),
        crm_status: l.crm_status || "new",
        priority: l.priority || "MEDIUM",
      })) as Lead[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      toast({ title: "Lead deleted" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleConvertToCase = async (lead: Lead) => {
    setConvertingId(lead.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const leadForConversion: LeadForConversion = {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        procedure_interest: lead.procedure_interest,
      };

      const { caseId, caseCode } = await convertLeadToCase(leadForConversion, session.user.id);
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      toast({
        title: "Case created",
        description: `${caseCode} created for ${lead.name}.`,
      });
      navigate(`/coordinator/cases/${caseId}`);
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally {
      setConvertingId(null);
    }
  };

  // Tab counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: rawLeads.length };
    for (const t of LEAD_TYPES.filter((t) => t.value !== "all")) {
      map[t.value] = rawLeads.filter((l) => l.lead_type === t.value).length;
    }
    return map;
  }, [rawLeads]);

  // Filtered leads
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
      const matchPriority = priorityFilter === "all" || l.priority === priorityFilter;
      const matchCity = !cityFilter || (l.city || "").toLowerCase().includes(cityFilter.toLowerCase());
      return matchTab && matchSearch && matchStatus && matchPriority && matchCity;
    });
  }, [rawLeads, activeTab, search, statusFilter, priorityFilter, cityFilter]);

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || cityFilter;
  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCityFilter("");
  };

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rawLeads.length} total enquiries
          </p>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
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

      {/* ── Search + Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, city, interest…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CRMStatus | "all")}>
          <SelectTrigger className="w-[180px] rounded-lg">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {CRM_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
          <SelectTrigger className="w-[150px] rounded-lg">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City filter */}
        <Input
          placeholder="Filter by city…"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-[150px] rounded-lg"
        />

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline whitespace-nowrap"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* ── Count ─────────────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> lead{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== rawLeads.length && ` (filtered from ${rawLeads.length})`}
      </p>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">City</TableHead>
                <TableHead className="font-semibold">Enquiry / Interest</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold">Assigned</TableHead>
                <TableHead className="font-semibold">Follow-up</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="w-[100px] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-10">
                    Loading leads…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-16">
                    <div className="text-center">
                      <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No leads found.</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-primary hover:underline mt-1">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((lead) => {
                const overdue = isOverdue(lead.follow_up_date) && !["converted", "closed", "not_interested"].includes(lead.crm_status);
                return (
                  <TableRow key={lead.id} className="hover:bg-secondary/30 transition-colors">
                    {/* Name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {leadTypeIcon(lead.lead_type)}
                        <span className="font-medium text-sm text-foreground">{lead.name}</span>
                      </div>
                    </TableCell>

                    {/* Contact */}
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

                    {/* City */}
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.city || <span className="text-muted-foreground/40">—</span>}
                    </TableCell>

                    {/* Interest */}
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lead.procedure_interest || <span className="text-muted-foreground/40">—</span>}
                      </p>
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      {lead.source_page ? (
                        <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                          {lead.source_page}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{statusBadge(lead.crm_status)}</TableCell>

                    {/* Priority */}
                    <TableCell>{priorityBadge(lead.priority)}</TableCell>

                    {/* Assigned */}
                    <TableCell className="text-xs text-muted-foreground">
                      {lead.assigned_to || <span className="text-muted-foreground/40">Unassigned</span>}
                    </TableCell>

                    {/* Follow-up */}
                    <TableCell>
                      {lead.follow_up_date ? (
                        <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                          {overdue && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                          <Calendar className={`h-3 w-3 ${overdue ? "" : "shrink-0"}`} />
                          {new Date(lead.follow_up_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Convert to Case — only for patient enquiries not yet converted */}
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
                        <button
                          onClick={() => setEditLead(lead)}
                          title="View / Edit"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead for ${lead.name}?`)) {
                              deleteMutation.mutate(lead.id);
                            }
                          }}
                          title="Delete"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── Edit modal ─────────────────────────────────────────────────────── */}
      {editLead && (
        <LeadEditModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["admin-leads"] })}
        />
      )}
    </div>
  );
};

export default AdminLeads;
