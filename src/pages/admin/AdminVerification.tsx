import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle2, XCircle, MessageSquare, Clock, Eye } from "lucide-react";

type VerificationStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

const STATUS_CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  PENDING_VERIFICATION: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  CHANGES_REQUESTED: { label: "Changes Requested", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  SUSPENDED: { label: "Suspended", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as VerificationStatus] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "CHANGES_REQUESTED", label: "Changes Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

interface ActionDialog {
  open: boolean;
  type: "approve" | "reject" | "review" | "changes" | "suspend" | null;
  profileType: "doctor" | "hospital";
  profileId: string;
  profileName: string;
  previousStatus: VerificationStatus;
}

const EMPTY_DIALOG: ActionDialog = {
  open: false, type: null, profileType: "doctor", profileId: "", profileName: "", previousStatus: "PENDING_VERIFICATION",
};

const AdminVerification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialog, setDialog] = useState<ActionDialog>(EMPTY_DIALOG);
  const [reason, setReason] = useState("");

  const { data: doctors = [] } = useQuery({
    queryKey: ["verification-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, designation, status, is_published, is_active, submitted_at, medical_reg_number")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["verification-hospitals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, area, status, is_published, is_active, submitted_at, contact_person, license_number")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      profileType, profileId, newStatus, previousStatus, actionReason,
    }: {
      profileType: "doctor" | "hospital";
      profileId: string;
      newStatus: VerificationStatus;
      previousStatus: VerificationStatus;
      actionReason?: string;
    }) => {
      const table = profileType === "doctor" ? "doctors" : "locations";
      const isPublished = newStatus === "APPROVED";

      const updatePayload: any = {
        status: newStatus,
        is_published: isPublished,
      };

      if (newStatus === "APPROVED") {
        updatePayload.verified_at = new Date().toISOString();
      }
      if (newStatus === "REJECTED" || newStatus === "CHANGES_REQUESTED") {
        updatePayload.rejection_reason = actionReason || null;
      }

      const { error: updateErr } = await supabase.from(table).update(updatePayload).eq("id", profileId);
      if (updateErr) throw updateErr;

      // Write audit log
      const { error: auditErr } = await supabase.from("verification_audit_log").insert({
        profile_type: profileType,
        profile_id: profileId,
        previous_status: previousStatus,
        new_status: newStatus,
        action_reason: actionReason || null,
      });
      if (auditErr) throw auditErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["verification-hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialog(EMPTY_DIALOG);
      setReason("");
      toast({ title: "Status updated successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openAction = (
    type: ActionDialog["type"],
    profileType: "doctor" | "hospital",
    profileId: string,
    profileName: string,
    previousStatus: VerificationStatus,
  ) => {
    setReason("");
    setDialog({ open: true, type, profileType, profileId, profileName, previousStatus });
  };

  const confirmAction = () => {
    if (!dialog.type || !dialog.profileId) return;
    const statusMap: Record<NonNullable<ActionDialog["type"]>, VerificationStatus> = {
      approve: "APPROVED",
      reject: "REJECTED",
      review: "UNDER_REVIEW",
      changes: "CHANGES_REQUESTED",
      suspend: "SUSPENDED",
    };
    actionMutation.mutate({
      profileType: dialog.profileType,
      profileId: dialog.profileId,
      newStatus: statusMap[dialog.type],
      previousStatus: dialog.previousStatus,
      actionReason: reason,
    });
  };

  const filterRecords = (records: any[]) => {
    return records.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const renderActions = (r: any, profileType: "doctor" | "hospital") => {
    const status = r.status as VerificationStatus;
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {status !== "UNDER_REVIEW" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={() => openAction("review", profileType, r.id, r.name, status)}>
            <Eye className="h-3 w-3" /> Review
          </Button>
        )}
        {status !== "APPROVED" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
            onClick={() => openAction("approve", profileType, r.id, r.name, status)}>
            <CheckCircle2 className="h-3 w-3" /> Approve
          </Button>
        )}
        {status !== "CHANGES_REQUESTED" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-orange-700 border-orange-300 hover:bg-orange-50"
            onClick={() => openAction("changes", profileType, r.id, r.name, status)}>
            <MessageSquare className="h-3 w-3" /> Changes
          </Button>
        )}
        {status !== "REJECTED" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => openAction("reject", profileType, r.id, r.name, status)}>
            <XCircle className="h-3 w-3" /> Reject
          </Button>
        )}
        {status !== "SUSPENDED" && status === "APPROVED" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-700 border-red-300 hover:bg-red-50"
            onClick={() => openAction("suspend", profileType, r.id, r.name, status)}>
            <Clock className="h-3 w-3" /> Suspend
          </Button>
        )}
      </div>
    );
  };

  const actionLabels: Record<NonNullable<ActionDialog["type"]>, string> = {
    approve: "Approve",
    reject: "Reject",
    review: "Mark as Under Review",
    changes: "Request Changes",
    suspend: "Suspend",
  };

  const needsReason = dialog.type === "reject" || dialog.type === "changes" || dialog.type === "suspend";

  const pendingDoctorsCount = doctors.filter((d) => d.status === "PENDING_VERIFICATION").length;
  const pendingHospitalsCount = hospitals.filter((h) => h.status === "PENDING_VERIFICATION").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Verification Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and verify doctor and hospital profiles before they go live.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending Doctors", value: pendingDoctorsCount, color: "text-amber-600" },
          { label: "Pending Hospitals", value: pendingHospitalsCount, color: "text-amber-600" },
          { label: "Total Doctors", value: doctors.length, color: "text-foreground" },
          { label: "Total Hospitals", value: hospitals.length, color: "text-foreground" },
        ].map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-4">
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="doctors">
        <TabsList className="mb-4">
          <TabsTrigger value="doctors">
            Doctors {pendingDoctorsCount > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingDoctorsCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="hospitals">
            Hospitals {pendingHospitalsCount > 0 && <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingHospitalsCount}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Reg. Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterRecords(doctors).map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.designation}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.medical_reg_number || "—"}</TableCell>
                      <TableCell><StatusBadge status={d.status || "DRAFT"} /></TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${d.is_published ? "text-green-600" : "text-muted-foreground"}`}>
                          {d.is_published ? "Live" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.submitted_at ? new Date(d.submitted_at).toLocaleDateString("en-IN") : "—"}
                      </TableCell>
                      <TableCell>{renderActions(d, "doctor")}</TableCell>
                    </TableRow>
                  ))}
                  {filterRecords(doctors).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No records found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hospitals">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>License No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterRecords(hospitals).map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{h.area}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{h.contact_person || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{h.license_number || "—"}</TableCell>
                      <TableCell><StatusBadge status={h.status || "DRAFT"} /></TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${h.is_published ? "text-green-600" : "text-muted-foreground"}`}>
                          {h.is_published ? "Live" : "Hidden"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {h.submitted_at ? new Date(h.submitted_at).toLocaleDateString("en-IN") : "—"}
                      </TableCell>
                      <TableCell>{renderActions(h, "hospital")}</TableCell>
                    </TableRow>
                  ))}
                  {filterRecords(hospitals).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No records found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action confirmation dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => { if (!open) setDialog(EMPTY_DIALOG); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.type ? actionLabels[dialog.type] : ""}: {dialog.profileName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {dialog.type === "approve" && "This will mark the profile as Approved and make it visible on the public site."}
              {dialog.type === "reject" && "This will reject the profile and hide it from the public site. Please provide a reason."}
              {dialog.type === "review" && "This will mark the profile as Under Review, indicating it is being actively reviewed."}
              {dialog.type === "changes" && "This will request changes from the submitter. Please describe what needs to be fixed."}
              {dialog.type === "suspend" && "This will suspend an approved profile and hide it from the public site. Please provide a reason."}
            </p>
            {needsReason && (
              <div className="space-y-2">
                <Label>{dialog.type === "changes" ? "Change Request Notes" : "Reason"} <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder={dialog.type === "changes" ? "Describe what changes are required..." : "Provide reason for rejection/suspension..."}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(EMPTY_DIALOG)}>Cancel</Button>
            <Button
              onClick={confirmAction}
              disabled={actionMutation.isPending || (needsReason && !reason.trim())}
              variant={dialog.type === "reject" || dialog.type === "suspend" ? "destructive" : "default"}
            >
              {actionMutation.isPending ? "Saving..." : (dialog.type ? actionLabels[dialog.type] : "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerification;
