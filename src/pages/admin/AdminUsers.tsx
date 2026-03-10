import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, ShieldOff, KeyRound, Users, Plus, Trash2, UserCog, LayoutDashboard, Stethoscope, Building2, ClipboardList, User } from "lucide-react";

const ROLES = [
  { value: "admin",       label: "Admin",       icon: LayoutDashboard, description: "Full access to all admin features, users, and settings", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "coordinator", label: "Coordinator",  icon: ClipboardList,   description: "Manage cases, patient follow-ups, and communications", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "doctor",      label: "Doctor",       icon: Stethoscope,     description: "View and manage assigned cases and patient records", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "hospital",    label: "Hospital",     icon: Building2,       description: "Manage facility cases, staff, and hospital operations", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "patient",     label: "Patient",      icon: User,            description: "Submit cases, view appointments and health records", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "user",        label: "User",         icon: User,            description: "Standard access — same as Patient", color: "bg-muted text-muted-foreground border-border" },
];

function RoleBadge({ role }: { role: string }) {
  const r = ROLES.find((x) => x.value === role);
  const cls = r?.color ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {r && <r.icon className="h-3 w-3" />}
      {r?.label ?? role}
    </span>
  );
}

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  role: string;
}

const callManageUsers = async (body: Record<string, any>) => {
  // Get session — if null, user must sign in again
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Session expired — please sign out and sign back in");
  }

  // Use raw fetch so the Authorization header is never overridden by the SDK
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const response = await fetch(`${supabaseUrl}/functions/v1/manage-users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": anonKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  if (data?.error) throw new Error(data.error);
  return data;
};

const AdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", role: "patient" });

  const [roleDialog, setRoleDialog] = useState<UserInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [passwordDialog, setPasswordDialog] = useState<UserInfo | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<UserInfo | null>(null);

  const { data: users, isLoading } = useQuery<UserInfo[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await callManageUsers({ action: "list" });
      return res.users;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: typeof createForm) =>
      callManageUsers({ action: "create_user", email: f.email, password: f.password, role: f.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User created successfully" });
      setCreateDialog(false);
      setCreateForm({ email: "", password: "", role: "patient" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) =>
      callManageUsers({ action: "change_role", user_id, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role updated successfully" });
      setRoleDialog(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ user_id, password }: { user_id: string; password: string }) =>
      callManageUsers({ action: "change_password", user_id, password }),
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setPasswordDialog(null);
      setNewPassword("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ user_id, ban }: { user_id: string; ban: boolean }) =>
      callManageUsers({ action: ban ? "ban" : "unban", user_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User status updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (user_id: string) =>
      callManageUsers({ action: "delete_user", user_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User deleted" });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const formatDate = (d: string | null) => {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="font-serif text-3xl font-bold text-foreground">Users</h1>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* RBAC Legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {ROLES.map((r) => (
          <div key={r.value} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.color} border`}>
              <r.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{r.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.banned ? "destructive" : "outline"}
                      className={!user.banned ? "border-green-500 text-green-700" : ""}
                    >
                      {user.banned ? "Inactive" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline" size="icon"
                        title="Change Role"
                        onClick={() => { setRoleDialog(user); setSelectedRole(user.role); }}
                      >
                        <UserCog className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline" size="icon"
                        title="Change Password"
                        onClick={() => { setPasswordDialog(user); setNewPassword(""); }}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={user.banned ? "default" : "outline"} size="icon"
                        title={user.banned ? "Activate" : "Deactivate"}
                        onClick={() => toggleStatusMutation.mutate({ user_id: user.id, ban: !user.banned })}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {user.banned
                          ? <Shield className="h-3.5 w-3.5" />
                          : <ShieldOff className="h-3.5 w-3.5" />
                        }
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(createForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email" required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="user@conceev.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password" required minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex items-center gap-2">
                        <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{r.label}</span>
                        <span className="text-xs text-muted-foreground">— {r.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(open) => !open && setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Role</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Update role for <span className="font-medium text-foreground">{roleDialog?.email}</span>
          </p>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className="font-medium">{r.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">— {r.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>Cancel</Button>
            <Button
              onClick={() => roleDialog && changeRoleMutation.mutate({ user_id: roleDialog.id, role: selectedRole })}
              disabled={!selectedRole || changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? "Saving..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!passwordDialog} onOpenChange={(open) => !open && setPasswordDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Change password for <span className="font-medium text-foreground">{passwordDialog?.email}</span>
          </p>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(null)}>Cancel</Button>
            <Button
              onClick={() => passwordDialog && changePasswordMutation.mutate({ user_id: passwordDialog.id, password: newPassword })}
              disabled={newPassword.length < 6 || changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Saving..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.email}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
