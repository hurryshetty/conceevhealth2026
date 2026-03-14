import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, MapPin, Shield, Bell, Stethoscope, Building2, Heart,
  UserCog, Pencil, Save, X, Loader2, Eye, EyeOff,
  BadgeCheck, AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionId = "basic" | "address" | "account" | "notifications" | "role";
type AppRole = "superadmin" | "admin" | "coordinator" | "hospital" | "doctor" | "patient" | "user";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDERS = [
  { value: "male",           label: "Male" },
  { value: "female",         label: "Female" },
  { value: "other",          label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function getRoleSection(role: AppRole | null) {
  switch (role) {
    case "doctor":     return { id: "role" as SectionId, label: "Professional Info", icon: Stethoscope };
    case "hospital":   return { id: "role" as SectionId, label: "Hospital Profile",  icon: Building2 };
    case "patient":
    case "user":       return { id: "role" as SectionId, label: "Medical Info",       icon: Heart };
    case "coordinator":return { id: "role" as SectionId, label: "Team Details",       icon: UserCog };
    default:           return { id: "role" as SectionId, label: "Admin Details",      icon: UserCog };
  }
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ElementType;
  isEditing: boolean;
  saving?: boolean;
  hideEdit?: boolean;
  verified?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

const SectionCard = ({
  title, icon: Icon, isEditing, saving, hideEdit, verified,
  onEdit, onSave, onCancel, children,
}: SectionCardProps) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        {verified && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        )}
      </div>
      {!hideEdit && (
        !isEditing ? (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving} className="h-7 gap-1 text-xs">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </Button>
          </div>
        )
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Field Display ────────────────────────────────────────────────────────────

const Field = ({ label, value, span2 }: { label: string; value?: string | null; span2?: boolean }) => (
  <div className={span2 ? "col-span-2" : ""}>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">
      {value || <span className="text-muted-foreground/50 font-normal">—</span>}
    </p>
  </div>
);

const NotifRow = ({ label, on }: { label: string; on: boolean }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-foreground">{label}</span>
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
      on ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
    }`}>{on ? "On" : "Off"}</span>
  </div>
);

const NotifToggle = ({
  label, desc, checked, onChange,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProfileSettings = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeSection, setActiveSection]   = useState<SectionId>("basic");
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);

  // Form states per section
  const [basicForm,   setBasicForm]   = useState<any>(null);
  const [addressForm, setAddressForm] = useState<any>(null);
  const [notifForm,   setNotifForm]   = useState<any>(null);
  const [roleForm,    setRoleForm]    = useState<any>(null);

  // Password change
  const [pwForm,     setPwForm]    = useState({ newPw: "", confirm: "" });
  const [showPw,     setShowPw]    = useState(false);
  const [pwChanging, setPwChanging] = useState(false);

  const roleSection = getRoleSection(role as AppRole | null);

  const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
    { id: "basic",         label: "Basic Info",         icon: User },
    { id: "address",       label: "Address",            icon: MapPin },
    { id: "account",       label: "Account & Security", icon: Shield },
    { id: "notifications", label: "Notifications",      icon: Bell },
    roleSection,
  ];

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data as any;
    },
    enabled: !!user,
  });

  const { data: doctorRecord } = useQuery({
    queryKey: ["my-doctor-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("doctors").select("*").eq("user_id", user!.id).maybeSingle();
      return data as any;
    },
    enabled: !!user && role === "doctor",
  });

  const { data: hospitalMembership } = useQuery({
    queryKey: ["my-hospital-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_members")
        .select("hospital_id, locations(*)")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as any;
    },
    enabled: !!user && role === "hospital",
  });

  // ── Basic Info ────────────────────────────────────────────────────────────

  const startEditBasic = () => {
    setBasicForm({
      full_name:       profile?.full_name       ?? "",
      display_name:    profile?.display_name    ?? "",
      phone:           profile?.phone           ?? "",
      alternate_phone: profile?.alternate_phone ?? "",
      date_of_birth:   profile?.date_of_birth   ?? "",
      gender:          profile?.gender          ?? "",
      bio:             profile?.bio             ?? "",
    });
    setEditingSection("basic");
  };

  const saveBasicMutation = useMutation({
    mutationFn: async () => {
      if (!basicForm.full_name.trim()) throw new Error("Full name is required");
      const { error } = await supabase.from("profiles").update({
        full_name:       basicForm.full_name.trim(),
        display_name:    basicForm.display_name   || null,
        phone:           basicForm.phone          || null,
        alternate_phone: basicForm.alternate_phone|| null,
        date_of_birth:   basicForm.date_of_birth  || null,
        gender:          basicForm.gender         || null,
        bio:             basicForm.bio            || null,
        updated_at:      new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      toast({ title: "Basic info updated" });
      setEditingSection(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Address ───────────────────────────────────────────────────────────────

  const startEditAddress = () => {
    setAddressForm({
      address_line1: profile?.address_line1 ?? "",
      address_line2: profile?.address_line2 ?? "",
      city:          profile?.city          ?? "",
      state:         profile?.state         ?? "",
      country:       profile?.country       ?? "India",
      pincode:       profile?.pincode       ?? "",
    });
    setEditingSection("address");
  };

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        address_line1: addressForm.address_line1 || null,
        address_line2: addressForm.address_line2 || null,
        city:          addressForm.city          || null,
        state:         addressForm.state         || null,
        country:       addressForm.country       || null,
        pincode:       addressForm.pincode       || null,
        updated_at:    new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      toast({ title: "Address updated" });
      setEditingSection(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  const startEditNotif = () => {
    setNotifForm({
      notif_email:         profile?.notif_email         ?? true,
      notif_sms:           profile?.notif_sms           ?? true,
      notif_whatsapp:      profile?.notif_whatsapp      ?? false,
      notif_case_updates:  profile?.notif_case_updates  ?? true,
      notif_appointments:  profile?.notif_appointments  ?? true,
      notif_billing:       profile?.notif_billing       ?? true,
    });
    setEditingSection("notifications");
  };

  const saveNotifMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        ...notifForm, updated_at: new Date().toISOString(),
      }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      toast({ title: "Notification preferences saved" });
      setEditingSection(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Role-specific ──────────────────────────────────────────────────────────

  const startEditRole = () => {
    if (role === "doctor") {
      setRoleForm({
        name:             doctorRecord?.name             ?? "",
        designation:      doctorRecord?.designation      ?? "",
        experience:       doctorRecord?.experience       ?? "",
        bio:              doctorRecord?.bio              ?? "",
        consultation_fee: doctorRecord?.consultation_fee ?? "",
        languages:        (doctorRecord?.languages       ?? []).join(", "),
        qualifications:   (doctorRecord?.qualifications  ?? []).join("\n"),
        specializations:  (doctorRecord?.specializations ?? []).join(", "),
      });
    } else if (role === "hospital") {
      const loc = hospitalMembership?.locations ?? {};
      setRoleForm({
        name:    loc.name    ?? "",
        address: loc.address ?? "",
        city:    loc.city    ?? "",
        state:   loc.state   ?? "",
        phone:   loc.phone   ?? "",
        email:   loc.email   ?? "",
      });
    } else if (role === "patient" || role === "user") {
      setRoleForm({
        emergency_contact_name:         profile?.emergency_contact_name         ?? "",
        emergency_contact_phone:        profile?.emergency_contact_phone        ?? "",
        emergency_contact_relationship: profile?.emergency_contact_relationship ?? "",
        blood_group:                    profile?.blood_group                    ?? "",
        allergies:                      profile?.allergies                      ?? "",
        medical_conditions:             profile?.medical_conditions             ?? "",
        insurance_provider:             profile?.insurance_provider             ?? "",
        insurance_number:               profile?.insurance_number               ?? "",
      });
    } else {
      setRoleForm({
        department:      profile?.department      ?? "",
        employee_id:     profile?.employee_id     ?? "",
        assigned_region: profile?.assigned_region ?? "",
      });
    }
    setEditingSection("role");
  };

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      if (role === "doctor" && doctorRecord) {
        const { error } = await supabase.from("doctors").update({
          name:             roleForm.name || doctorRecord.name,
          designation:      roleForm.designation      || null,
          experience:       roleForm.experience        || null,
          bio:              roleForm.bio               || null,
          consultation_fee: roleForm.consultation_fee  || null,
          languages:     roleForm.languages.split(",").map((s: string) => s.trim()).filter(Boolean),
          qualifications:roleForm.qualifications.split("\n").map((s: string) => s.trim()).filter(Boolean),
          specializations:roleForm.specializations.split(",").map((s: string) => s.trim()).filter(Boolean),
        }).eq("id", doctorRecord.id);
        if (error) throw error;
      } else if (role === "hospital" && hospitalMembership?.hospital_id) {
        const { error } = await supabase.from("locations").update({
          name:    roleForm.name    || null,
          address: roleForm.address || null,
          city:    roleForm.city    || null,
          state:   roleForm.state   || null,
          phone:   roleForm.phone   || null,
          email:   roleForm.email   || null,
        }).eq("id", hospitalMembership.hospital_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").update({
          ...roleForm, updated_at: new Date().toISOString(),
        }).eq("id", user!.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile",          user?.id] });
      qc.invalidateQueries({ queryKey: ["my-doctor-record",    user?.id] });
      qc.invalidateQueries({ queryKey: ["my-hospital-record",  user?.id] });
      toast({ title: "Profile updated" });
      setEditingSection(null);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Password change ───────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    if (!pwForm.newPw || pwForm.newPw.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPwChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      toast({ title: "Password changed successfully" });
      setPwForm({ newPw: "", confirm: "" });
      setEditingSection(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPwChanging(false);
    }
  };

  // ── Profile completion ────────────────────────────────────────────────────

  const completionFields = [
    profile?.full_name, profile?.phone, profile?.date_of_birth,
    profile?.gender, profile?.city, profile?.state,
  ];
  const completionPct = isLoading ? 0
    : Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  if (isLoading) return <p className="text-muted-foreground p-4">Loading profile…</p>;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
      </div>

      {/* Profile completion bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-foreground">Profile Completion</p>
            <span className="text-sm font-bold text-primary">{completionPct}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
        {completionPct === 100 && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <BadgeCheck className="h-4 w-4" /> Complete
          </span>
        )}
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Section nav (desktop sidebar) ── */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 sticky top-8">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setEditingSection(null); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Section nav (mobile tabs) ── */}
        <div className="lg:hidden w-full -mt-2 mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setEditingSection(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  activeSection === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section content ── */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* ── Basic Info ──────────────────────────────────────────────────── */}
          {activeSection === "basic" && (
            <SectionCard
              title="Basic Information" icon={User}
              isEditing={editingSection === "basic"}
              saving={saveBasicMutation.isPending}
              onEdit={startEditBasic}
              onSave={() => saveBasicMutation.mutate()}
              onCancel={() => setEditingSection(null)}
            >
              {editingSection === "basic" && basicForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Full Name <span className="text-destructive">*</span></Label>
                    <Input value={basicForm.full_name} onChange={(e) => setBasicForm((p: any) => ({ ...p, full_name: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Display Name</Label>
                    <Input value={basicForm.display_name} onChange={(e) => setBasicForm((p: any) => ({ ...p, display_name: e.target.value }))} className="rounded-lg text-sm" placeholder="Nickname or preferred name" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Phone</Label>
                    <Input value={basicForm.phone} onChange={(e) => setBasicForm((p: any) => ({ ...p, phone: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Alternate Phone</Label>
                    <Input value={basicForm.alternate_phone} onChange={(e) => setBasicForm((p: any) => ({ ...p, alternate_phone: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Date of Birth</Label>
                    <Input type="date" value={basicForm.date_of_birth} onChange={(e) => setBasicForm((p: any) => ({ ...p, date_of_birth: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Gender</Label>
                    <Select value={basicForm.gender} onValueChange={(v) => setBasicForm((p: any) => ({ ...p, gender: v }))}>
                      <SelectTrigger className="rounded-lg text-sm"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1.5 block">Bio / About</Label>
                    <Textarea value={basicForm.bio} onChange={(e) => setBasicForm((p: any) => ({ ...p, bio: e.target.value }))} rows={3} className="resize-none text-sm" placeholder="Short description about yourself…" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Full Name"      value={profile?.full_name} />
                  <Field label="Display Name"   value={profile?.display_name} />
                  <Field label="Email"          value={user?.email} />
                  <Field label="Phone"          value={profile?.phone} />
                  <Field label="Alternate Phone"value={profile?.alternate_phone} />
                  <Field label="Date of Birth"  value={profile?.date_of_birth} />
                  <Field label="Gender"         value={GENDERS.find((g) => g.value === profile?.gender)?.label} />
                  {profile?.bio && <Field label="Bio" value={profile.bio} span2 />}
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Address ──────────────────────────────────────────────────────── */}
          {activeSection === "address" && (
            <SectionCard
              title="Address Information" icon={MapPin}
              isEditing={editingSection === "address"}
              saving={saveAddressMutation.isPending}
              onEdit={startEditAddress}
              onSave={() => saveAddressMutation.mutate()}
              onCancel={() => setEditingSection(null)}
            >
              {editingSection === "address" && addressForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs mb-1.5 block">Address Line 1</Label>
                    <Input value={addressForm.address_line1} onChange={(e) => setAddressForm((p: any) => ({ ...p, address_line1: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1.5 block">Address Line 2</Label>
                    <Input value={addressForm.address_line2} onChange={(e) => setAddressForm((p: any) => ({ ...p, address_line2: e.target.value }))} className="rounded-lg text-sm" placeholder="Apartment, suite, etc." />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">City</Label>
                    <Input value={addressForm.city} onChange={(e) => setAddressForm((p: any) => ({ ...p, city: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">State</Label>
                    <Input value={addressForm.state} onChange={(e) => setAddressForm((p: any) => ({ ...p, state: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Country</Label>
                    <Input value={addressForm.country} onChange={(e) => setAddressForm((p: any) => ({ ...p, country: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Pincode / ZIP</Label>
                    <Input value={addressForm.pincode} onChange={(e) => setAddressForm((p: any) => ({ ...p, pincode: e.target.value }))} className="rounded-lg text-sm" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Address" span2
                    value={[profile?.address_line1, profile?.address_line2].filter(Boolean).join(", ")} />
                  <Field label="City"       value={profile?.city} />
                  <Field label="State"      value={profile?.state} />
                  <Field label="Country"    value={profile?.country} />
                  <Field label="Pincode"    value={profile?.pincode} />
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Account & Security ───────────────────────────────────────────── */}
          {activeSection === "account" && (
            <div className="space-y-4">
              {/* Account overview */}
              <SectionCard
                title="Account Info" icon={Shield}
                isEditing={false} hideEdit
                onEdit={() => {}} onSave={() => {}} onCancel={() => {}}
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Email"           value={user?.email} />
                  <Field label="Role"            value={role ? role.charAt(0).toUpperCase() + role.slice(1) : undefined} />
                  <Field label="Last Sign In"    value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : undefined} />
                  <Field label="Account Created" value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
                </div>
              </SectionCard>

              {/* Change password */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-secondary/30">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">Change Password</h3>
                </div>
                <div className="p-5">
                  {editingSection === "account" ? (
                    <div className="space-y-4 max-w-sm">
                      <div>
                        <Label className="text-xs mb-1.5 block">New Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input
                            type={showPw ? "text" : "password"}
                            value={pwForm.newPw}
                            onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))}
                            className="rounded-lg text-sm pr-9"
                            placeholder="Min. 8 characters"
                          />
                          <button
                            type="button"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPw((v) => !v)}
                          >
                            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-1.5 block">Confirm New Password <span className="text-destructive">*</span></Label>
                        <Input
                          type={showPw ? "text" : "password"}
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                          className="rounded-lg text-sm"
                          placeholder="Re-enter new password"
                        />
                        {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                          <p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Passwords do not match
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleChangePassword} disabled={pwChanging} className="gap-2">
                          {pwChanging && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Update Password
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingSection(null); setPwForm({ newPw: "", confirm: "" }); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditingSection("account")} className="gap-2">
                      <Pencil className="h-3.5 w-3.5" /> Change Password
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ─────────────────────────────────────────────────── */}
          {activeSection === "notifications" && (
            <SectionCard
              title="Notification Preferences" icon={Bell}
              isEditing={editingSection === "notifications"}
              saving={saveNotifMutation.isPending}
              onEdit={startEditNotif}
              onSave={() => saveNotifMutation.mutate()}
              onCancel={() => setEditingSection(null)}
            >
              {editingSection === "notifications" && notifForm ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Channels</p>
                    <div className="space-y-4">
                      <NotifToggle label="Email Notifications" desc="Receive updates via email" checked={notifForm.notif_email} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_email: v }))} />
                      <NotifToggle label="SMS Notifications" desc="Receive updates via SMS" checked={notifForm.notif_sms} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_sms: v }))} />
                      <NotifToggle label="WhatsApp Notifications" desc="Receive updates on WhatsApp" checked={notifForm.notif_whatsapp} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_whatsapp: v }))} />
                    </div>
                  </div>
                  <div className="border-t border-border pt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Alert Types</p>
                    <div className="space-y-4">
                      <NotifToggle label="Case Updates" desc="Status changes, new assignments" checked={notifForm.notif_case_updates} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_case_updates: v }))} />
                      <NotifToggle label="Appointments" desc="Upcoming and confirmed appointments" checked={notifForm.notif_appointments} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_appointments: v }))} />
                      <NotifToggle label="Billing & Payments" desc="Invoices, payment due reminders" checked={notifForm.notif_billing} onChange={(v) => setNotifForm((p: any) => ({ ...p, notif_billing: v }))} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Channels</p>
                    <div className="space-y-1">
                      <NotifRow label="Email"     on={profile?.notif_email     !== false} />
                      <NotifRow label="SMS"       on={profile?.notif_sms       !== false} />
                      <NotifRow label="WhatsApp"  on={profile?.notif_whatsapp  === true}  />
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Alert Types</p>
                    <div className="space-y-1">
                      <NotifRow label="Case Updates"      on={profile?.notif_case_updates  !== false} />
                      <NotifRow label="Appointments"      on={profile?.notif_appointments  !== false} />
                      <NotifRow label="Billing & Payments"on={profile?.notif_billing        !== false} />
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Role-specific section ──────────────────────────────────────────── */}
          {activeSection === "role" && (
            <SectionCard
              title={roleSection.label} icon={roleSection.icon}
              isEditing={editingSection === "role"}
              saving={saveRoleMutation.isPending}
              verified={role === "doctor" ? doctorRecord?.is_verified : undefined}
              onEdit={startEditRole}
              onSave={() => saveRoleMutation.mutate()}
              onCancel={() => setEditingSection(null)}
            >

              {/* ── Doctor ── */}
              {role === "doctor" && (
                editingSection === "role" && roleForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Doctor Name</Label>
                      <Input value={roleForm.name} onChange={(e) => setRoleForm((p: any) => ({ ...p, name: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Designation</Label>
                      <Input value={roleForm.designation} onChange={(e) => setRoleForm((p: any) => ({ ...p, designation: e.target.value }))} className="rounded-lg text-sm" placeholder="e.g. IVF Specialist" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Experience</Label>
                      <Input value={roleForm.experience} onChange={(e) => setRoleForm((p: any) => ({ ...p, experience: e.target.value }))} className="rounded-lg text-sm" placeholder="e.g. 10 Years" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Consultation Fee (₹)</Label>
                      <Input value={roleForm.consultation_fee} onChange={(e) => setRoleForm((p: any) => ({ ...p, consultation_fee: e.target.value }))} className="rounded-lg text-sm" placeholder="e.g. 1500" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Qualifications <span className="text-muted-foreground text-[11px]">(one per line)</span></Label>
                      <Textarea value={roleForm.qualifications} onChange={(e) => setRoleForm((p: any) => ({ ...p, qualifications: e.target.value }))} rows={3} className="resize-none text-sm" placeholder={"MBBS\nMD (Obs & Gynae)"} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Specializations <span className="text-muted-foreground text-[11px]">(comma separated)</span></Label>
                      <Input value={roleForm.specializations} onChange={(e) => setRoleForm((p: any) => ({ ...p, specializations: e.target.value }))} className="rounded-lg text-sm" placeholder="IVF, ICSI, Laparoscopy" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Languages <span className="text-muted-foreground text-[11px]">(comma separated)</span></Label>
                      <Input value={roleForm.languages} onChange={(e) => setRoleForm((p: any) => ({ ...p, languages: e.target.value }))} className="rounded-lg text-sm" placeholder="English, Hindi, Telugu" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Bio / About</Label>
                      <Textarea value={roleForm.bio} onChange={(e) => setRoleForm((p: any) => ({ ...p, bio: e.target.value }))} rows={3} className="resize-none text-sm" placeholder="Brief description of your expertise…" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Doctor Name"       value={doctorRecord?.name} />
                    <Field label="Designation"       value={doctorRecord?.designation} />
                    <Field label="Experience"        value={doctorRecord?.experience} />
                    <Field label="Consultation Fee"  value={doctorRecord?.consultation_fee ? `₹${doctorRecord.consultation_fee}` : null} />
                    <Field label="Languages"         value={(doctorRecord?.languages ?? []).join(", ")} />
                    <Field label="Specializations"   value={(doctorRecord?.specializations ?? []).join(", ")} />
                    {(doctorRecord?.qualifications ?? []).length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Qualifications</p>
                        <ul className="space-y-0.5">
                          {(doctorRecord.qualifications as string[]).map((q: string) => (
                            <li key={q} className="text-sm font-medium">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {doctorRecord?.bio && <Field label="Bio" value={doctorRecord.bio} span2 />}
                  </div>
                )
              )}

              {/* ── Hospital ── */}
              {role === "hospital" && (
                editingSection === "role" && roleForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Hospital Name</Label>
                      <Input value={roleForm.name} onChange={(e) => setRoleForm((p: any) => ({ ...p, name: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Address</Label>
                      <Input value={roleForm.address} onChange={(e) => setRoleForm((p: any) => ({ ...p, address: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">City</Label>
                      <Input value={roleForm.city} onChange={(e) => setRoleForm((p: any) => ({ ...p, city: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">State</Label>
                      <Input value={roleForm.state} onChange={(e) => setRoleForm((p: any) => ({ ...p, state: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Contact Phone</Label>
                      <Input value={roleForm.phone} onChange={(e) => setRoleForm((p: any) => ({ ...p, phone: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Contact Email</Label>
                      <Input type="email" value={roleForm.email} onChange={(e) => setRoleForm((p: any) => ({ ...p, email: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Hospital Name" span2 value={hospitalMembership?.locations?.name} />
                    <Field label="Address"       span2 value={hospitalMembership?.locations?.address} />
                    <Field label="City"   value={hospitalMembership?.locations?.city} />
                    <Field label="State"  value={hospitalMembership?.locations?.state} />
                    <Field label="Phone"  value={hospitalMembership?.locations?.phone} />
                    <Field label="Email"  value={hospitalMembership?.locations?.email} />
                  </div>
                )
              )}

              {/* ── Patient / User ── */}
              {(role === "patient" || role === "user") && (
                editingSection === "role" && roleForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Emergency Contact Name</Label>
                      <Input value={roleForm.emergency_contact_name} onChange={(e) => setRoleForm((p: any) => ({ ...p, emergency_contact_name: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Emergency Contact Phone</Label>
                      <Input value={roleForm.emergency_contact_phone} onChange={(e) => setRoleForm((p: any) => ({ ...p, emergency_contact_phone: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Relationship</Label>
                      <Input value={roleForm.emergency_contact_relationship} onChange={(e) => setRoleForm((p: any) => ({ ...p, emergency_contact_relationship: e.target.value }))} className="rounded-lg text-sm" placeholder="e.g. Spouse, Parent" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Blood Group</Label>
                      <Select value={roleForm.blood_group} onValueChange={(v) => setRoleForm((p: any) => ({ ...p, blood_group: v }))}>
                        <SelectTrigger className="rounded-lg text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Known Allergies</Label>
                      <Textarea value={roleForm.allergies} onChange={(e) => setRoleForm((p: any) => ({ ...p, allergies: e.target.value }))} rows={2} className="resize-none text-sm" placeholder="List any known allergies…" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Existing Medical Conditions</Label>
                      <Textarea value={roleForm.medical_conditions} onChange={(e) => setRoleForm((p: any) => ({ ...p, medical_conditions: e.target.value }))} rows={2} className="resize-none text-sm" placeholder="Diabetes, hypertension, etc." />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Insurance Provider</Label>
                      <Input value={roleForm.insurance_provider} onChange={(e) => setRoleForm((p: any) => ({ ...p, insurance_provider: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Policy Number</Label>
                      <Input value={roleForm.insurance_number} onChange={(e) => setRoleForm((p: any) => ({ ...p, insurance_number: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Emergency Contact"    value={profile?.emergency_contact_name} />
                    <Field label="Contact Phone"        value={profile?.emergency_contact_phone} />
                    <Field label="Relationship"         value={profile?.emergency_contact_relationship} />
                    <Field label="Blood Group"          value={profile?.blood_group} />
                    {profile?.allergies         && <Field label="Allergies"          value={profile.allergies}         span2 />}
                    {profile?.medical_conditions && <Field label="Medical Conditions" value={profile.medical_conditions} span2 />}
                    <Field label="Insurance Provider"   value={profile?.insurance_provider} />
                    <Field label="Policy Number"        value={profile?.insurance_number} />
                  </div>
                )
              )}

              {/* ── Coordinator ── */}
              {role === "coordinator" && (
                editingSection === "role" && roleForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Employee ID</Label>
                      <Input value={roleForm.employee_id} onChange={(e) => setRoleForm((p: any) => ({ ...p, employee_id: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Department / Team</Label>
                      <Input value={roleForm.department} onChange={(e) => setRoleForm((p: any) => ({ ...p, department: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs mb-1.5 block">Assigned Region / City</Label>
                      <Input value={roleForm.assigned_region} onChange={(e) => setRoleForm((p: any) => ({ ...p, assigned_region: e.target.value }))} className="rounded-lg text-sm" placeholder="e.g. Bangalore, Hyderabad" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Employee ID"      value={profile?.employee_id} />
                    <Field label="Department"       value={profile?.department} />
                    <Field label="Assigned Region"  value={profile?.assigned_region} />
                  </div>
                )
              )}

              {/* ── Admin / Superadmin ── */}
              {(role === "admin" || role === "superadmin") && (
                editingSection === "role" && roleForm ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Department</Label>
                      <Input value={roleForm.department} onChange={(e) => setRoleForm((p: any) => ({ ...p, department: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Employee ID</Label>
                      <Input value={roleForm.employee_id} onChange={(e) => setRoleForm((p: any) => ({ ...p, employee_id: e.target.value }))} className="rounded-lg text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Department"  value={profile?.department} />
                    <Field label="Employee ID" value={profile?.employee_id} />
                    <Field label="Role"        value={role ? role.charAt(0).toUpperCase() + role.slice(1) : undefined} />
                  </div>
                )
              )}

            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
