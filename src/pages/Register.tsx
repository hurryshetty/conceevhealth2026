import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCities } from "@/hooks/useLocations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, User, Stethoscope, Building2, ChevronLeft, ChevronRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AccountType = "patient" | "doctor" | "hospital";

interface PatientForm {
  name: string; email: string; phone: string; password: string; confirm: string;
  dob: string; gender: string;
}

interface DoctorForm {
  name: string; email: string; phone: string; password: string; confirm: string;
  designation: string; medical_reg_number: string; experience: string;
  specializations: string; cities: string; languages: string;
  consultation_fee: string; bio: string; qualifications: string;
}

interface HospitalForm {
  name: string; contact_person: string; email: string; phone: string;
  password: string; confirm: string; license_number: string;
  address: string; city_id: string; area: string; surgeries: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DESIGNATIONS = [
  "MBBS", "MD", "MS", "DGO", "DNB", "MCh", "DM", "FRCOG", "FMAS",
  "Consultant", "Senior Consultant", "Associate Professor", "Professor",
  "HOD", "Director",
];

const EXPERIENCES = [
  "1-2 years", "3-5 years", "6-10 years", "10-15 years", "15-20 years",
  "20+ years",
];

const LANGUAGES = ["Hindi", "English", "Kannada", "Telugu", "Tamil", "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu"];

const SPECIALIZATIONS = [
  "IVF & ART", "Laparoscopic Surgery", "Robotic Surgery", "Hysteroscopy",
  "Endometriosis", "PCOD/PCOS", "High Risk Pregnancy", "Infertility",
  "Gynaecologic Oncology", "Urogynecology", "Menopause", "Reproductive Medicine",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function CheckboxGroup({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button type="button" key={opt}
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            selected.includes(opt)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border text-foreground hover:border-primary/50"
          }`}
        >{opt}</button>
      ))}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = "Min 6 characters", ...rest }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} {...rest} />
      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Account type cards ───────────────────────────────────────────────────────

const ACCOUNT_TYPES: { type: AccountType; icon: any; title: string; description: string; badge?: string }[] = [
  {
    type: "patient",
    icon: User,
    title: "I'm a Patient",
    description: "Looking for healthcare services, doctor consultations, or surgery packages.",
  },
  {
    type: "doctor",
    icon: Stethoscope,
    title: "I'm a Doctor",
    description: "List your profile, specializations, and connect with patients.",
    badge: "Verification Required",
  },
  {
    type: "hospital",
    icon: Building2,
    title: "I'm a Hospital",
    description: "Register your facility, list available procedures, and attract patients.",
    badge: "Verification Required",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cities = [] } = useCities();

  const [step, setStep] = useState<"type" | "form" | "success">("type");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);

  // Forms
  const [patientForm, setPatientForm] = useState<PatientForm>({
    name: "", email: "", phone: "", password: "", confirm: "", dob: "", gender: "",
  });
  const [doctorForm, setDoctorForm] = useState<DoctorForm>({
    name: "", email: "", phone: "", password: "", confirm: "",
    designation: "", medical_reg_number: "", experience: "",
    specializations: "", cities: "", languages: "",
    consultation_fee: "", bio: "", qualifications: "",
  });
  const [doctorSpecializations, setDoctorSpecializations] = useState<string[]>([]);
  const [doctorCities, setDoctorCities] = useState<string[]>([]);
  const [doctorLanguages, setDoctorLanguages] = useState<string[]>([]);

  const [hospitalForm, setHospitalForm] = useState<HospitalForm>({
    name: "", contact_person: "", email: "", phone: "",
    password: "", confirm: "", license_number: "",
    address: "", city_id: "", area: "", surgeries: "",
  });

  const selectType = (type: AccountType) => {
    setAccountType(type);
    setStep("form");
  };

  // ── Patient Submit ──────────────────────────────────────────────────────────
  const submitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientForm.password !== patientForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: patientForm.email,
      password: patientForm.password,
      options: { data: { full_name: patientForm.name }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) { toast({ title: "Registration failed", description: error.message, variant: "destructive" }); setLoading(false); return; }
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "patient" });
    }
    setLoading(false);
    setStep("success");
  };

  // ── Doctor Submit ───────────────────────────────────────────────────────────
  const submitDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorForm.password !== doctorForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (!doctorForm.designation || !doctorForm.experience) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: doctorForm.email,
      password: doctorForm.password,
      options: { data: { full_name: doctorForm.name }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) { toast({ title: "Registration failed", description: error.message, variant: "destructive" }); setLoading(false); return; }
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "doctor" });
      const baseSlug = toSlug(doctorForm.name);
      const slug = `${baseSlug}-${Date.now()}`;
      const qualificationsArr = doctorForm.qualifications.split("\n").map((q) => q.trim()).filter(Boolean);
      await supabase.from("doctors").insert({
        user_id: data.user.id,
        name: doctorForm.name,
        slug,
        designation: doctorForm.designation,
        medical_reg_number: doctorForm.medical_reg_number,
        experience: doctorForm.experience,
        specializations: doctorSpecializations,
        cities: doctorCities,
        languages: doctorLanguages,
        consultation_fee: doctorForm.consultation_fee,
        bio: doctorForm.bio,
        qualifications: qualificationsArr,
        hospitals: [],
        surgeries: [],
        status: "PENDING_VERIFICATION",
        is_published: false,
        submitted_at: new Date().toISOString(),
      });
    }
    setLoading(false);
    setStep("success");
  };

  // ── Hospital Submit ─────────────────────────────────────────────────────────
  const submitHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hospitalForm.password !== hospitalForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (!hospitalForm.city_id) {
      toast({ title: "Please select a city", variant: "destructive" }); return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: hospitalForm.email,
      password: hospitalForm.password,
      options: { data: { full_name: hospitalForm.name }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) { toast({ title: "Registration failed", description: error.message, variant: "destructive" }); setLoading(false); return; }
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "hospital" });
      const surgeriesArr = hospitalForm.surgeries.split(",").map((s) => s.trim()).filter(Boolean);
      await supabase.from("locations").insert({
        user_id: data.user.id,
        name: hospitalForm.name,
        contact_person: hospitalForm.contact_person,
        license_number: hospitalForm.license_number,
        area: hospitalForm.area,
        city_id: hospitalForm.city_id,
        surgeries: surgeriesArr,
        status: "PENDING_VERIFICATION",
        is_published: false,
        submitted_at: new Date().toISOString(),
      });
    }
    setLoading(false);
    setStep("success");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-serif text-xl font-bold text-foreground">Conceev Health</span>
        </Link>
        <span className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* ── Step: Type Selection ── */}
          {step === "type" && (
            <div>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Create your account</h1>
                <p className="text-muted-foreground">Choose how you'd like to use Conceev Health</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {ACCOUNT_TYPES.map(({ type, icon: Icon, title, description, badge }) => (
                  <button key={type} onClick={() => selectType(type)}
                    className="group relative text-left p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200">
                    {badge && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-foreground text-lg mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                      Get started <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-6">
                Admin or staff?{" "}
                <Link to="/admin/login" className="text-primary hover:underline">Admin login →</Link>
              </p>
            </div>
          )}

          {/* ── Step: Form ── */}
          {step === "form" && accountType && (
            <div className="bg-card border border-border rounded-2xl shadow-sm">
              {/* Form header */}
              <div className="p-6 border-b border-border flex items-center gap-3">
                <button onClick={() => setStep("type")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  {accountType === "patient" && <User className="h-5 w-5 text-primary" />}
                  {accountType === "doctor" && <Stethoscope className="h-5 w-5 text-primary" />}
                  {accountType === "hospital" && <Building2 className="h-5 w-5 text-primary" />}
                  <h2 className="font-serif text-xl font-bold text-foreground capitalize">
                    {accountType === "patient" ? "Patient" : accountType === "doctor" ? "Doctor" : "Hospital"} Registration
                  </h2>
                </div>
                {accountType !== "patient" && (
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                    Pending admin verification
                  </span>
                )}
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">

                {/* ── PATIENT FORM ── */}
                {accountType === "patient" && (
                  <form onSubmit={submitPatient} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name <span className="text-destructive">*</span></Label>
                        <Input required placeholder="Your full name"
                          value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input type="tel" placeholder="+91 98765 43210"
                          value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address <span className="text-destructive">*</span></Label>
                      <Input type="email" required placeholder="you@example.com"
                        value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date"
                          value={patientForm.dob} onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={patientForm.gender} onValueChange={(v) => setPatientForm({ ...patientForm, gender: v })}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Password <span className="text-destructive">*</span></Label>
                        <PasswordInput required minLength={6}
                          value={patientForm.password} onChange={(e: any) => setPatientForm({ ...patientForm, password: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password <span className="text-destructive">*</span></Label>
                        <PasswordInput required placeholder="Repeat password"
                          value={patientForm.confirm} onChange={(e: any) => setPatientForm({ ...patientForm, confirm: e.target.value })} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Creating account..." : "Create Patient Account"}
                    </Button>
                  </form>
                )}

                {/* ── DOCTOR FORM ── */}
                {accountType === "doctor" && (
                  <form onSubmit={submitDoctor} className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 pb-1.5 border-b border-border">Personal Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name <span className="text-destructive">*</span></Label>
                          <Input required placeholder="Dr. Full Name"
                            value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number <span className="text-destructive">*</span></Label>
                          <Input type="tel" required placeholder="+91 98765 43210"
                            value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Email Address <span className="text-destructive">*</span></Label>
                          <Input type="email" required placeholder="doctor@example.com"
                            value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Medical Reg. Number <span className="text-destructive">*</span></Label>
                          <Input required placeholder="MCI / State reg. number"
                            value={doctorForm.medical_reg_number} onChange={(e) => setDoctorForm({ ...doctorForm, medical_reg_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Password <span className="text-destructive">*</span></Label>
                          <PasswordInput required minLength={6}
                            value={doctorForm.password} onChange={(e: any) => setDoctorForm({ ...doctorForm, password: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm Password <span className="text-destructive">*</span></Label>
                          <PasswordInput required placeholder="Repeat password"
                            value={doctorForm.confirm} onChange={(e: any) => setDoctorForm({ ...doctorForm, confirm: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 pb-1.5 border-b border-border">Professional Details</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Designation <span className="text-destructive">*</span></Label>
                          <Select required value={doctorForm.designation} onValueChange={(v) => setDoctorForm({ ...doctorForm, designation: v })}>
                            <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                            <SelectContent>
                              {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Experience <span className="text-destructive">*</span></Label>
                          <Select required value={doctorForm.experience} onValueChange={(v) => setDoctorForm({ ...doctorForm, experience: v })}>
                            <SelectTrigger><SelectValue placeholder="Years of experience" /></SelectTrigger>
                            <SelectContent>
                              {EXPERIENCES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Consultation Fee</Label>
                          <Input placeholder="e.g. 800 or ₹800"
                            value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })} />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Specializations</Label>
                        <CheckboxGroup options={SPECIALIZATIONS} selected={doctorSpecializations} onChange={setDoctorSpecializations} />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Languages Spoken</Label>
                        <CheckboxGroup options={LANGUAGES} selected={doctorLanguages} onChange={setDoctorLanguages} />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Cities you practice in</Label>
                        <CheckboxGroup
                          options={cities.map((c) => c.name)}
                          selected={doctorCities}
                          onChange={setDoctorCities}
                        />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>Qualifications <span className="text-xs text-muted-foreground">(one per line)</span></Label>
                        <Textarea rows={3} placeholder={"MBBS – AIIMS Delhi\nMD – Obstetrics & Gynaecology\nFRCOG – UK"}
                          value={doctorForm.qualifications} onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })} />
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label>About / Bio</Label>
                        <Textarea rows={3} placeholder="Brief professional summary..."
                          value={doctorForm.bio} onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })} />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      Your profile will be reviewed by our team before going live. You'll be notified once approved.
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Doctor Profile"}
                    </Button>
                  </form>
                )}

                {/* ── HOSPITAL FORM ── */}
                {accountType === "hospital" && (
                  <form onSubmit={submitHospital} className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 pb-1.5 border-b border-border">Facility Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Hospital / Clinic Name <span className="text-destructive">*</span></Label>
                          <Input required placeholder="Full name of the facility"
                            value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Person Name <span className="text-destructive">*</span></Label>
                          <Input required placeholder="Name of authorized person"
                            value={hospitalForm.contact_person} onChange={(e) => setHospitalForm({ ...hospitalForm, contact_person: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>License / Registration Number <span className="text-destructive">*</span></Label>
                          <Input required placeholder="Hospital license number"
                            value={hospitalForm.license_number} onChange={(e) => setHospitalForm({ ...hospitalForm, license_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>City <span className="text-destructive">*</span></Label>
                          <Select required value={hospitalForm.city_id} onValueChange={(v) => setHospitalForm({ ...hospitalForm, city_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                            <SelectContent>
                              {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Area / Locality <span className="text-destructive">*</span></Label>
                          <Input required placeholder="e.g. Koramangala, Banjara Hills"
                            value={hospitalForm.area} onChange={(e) => setHospitalForm({ ...hospitalForm, area: e.target.value })} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Full Address</Label>
                          <Input placeholder="Street address, landmark"
                            value={hospitalForm.address} onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Surgeries / Procedures Offered <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
                          <Input placeholder="IVF, Laparoscopy, Hysteroscopy, Hysterectomy"
                            value={hospitalForm.surgeries} onChange={(e) => setHospitalForm({ ...hospitalForm, surgeries: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 pb-1.5 border-b border-border">Account Credentials</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email Address <span className="text-destructive">*</span></Label>
                          <Input type="email" required placeholder="hospital@example.com"
                            value={hospitalForm.email} onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number <span className="text-destructive">*</span></Label>
                          <Input type="tel" required placeholder="+91 98765 43210"
                            value={hospitalForm.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Password <span className="text-destructive">*</span></Label>
                          <PasswordInput required minLength={6}
                            value={hospitalForm.password} onChange={(e: any) => setHospitalForm({ ...hospitalForm, password: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm Password <span className="text-destructive">*</span></Label>
                          <PasswordInput required placeholder="Repeat password"
                            value={hospitalForm.confirm} onChange={(e: any) => setHospitalForm({ ...hospitalForm, confirm: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      Your facility will be reviewed by our team before appearing on the platform. You'll receive confirmation via email.
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Hospital Registration"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === "success" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
                {accountType === "patient" ? "Welcome aboard!" : "Application submitted!"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-2">
                {accountType === "patient"
                  ? "Your account has been created. Please check your email to verify your address, then sign in."
                  : accountType === "doctor"
                  ? "Your doctor profile has been submitted for review. Our team will verify your credentials and notify you via email once approved."
                  : "Your hospital registration has been submitted for review. Our team will verify your facility details and notify you via email once approved."}
              </p>
              {accountType !== "patient" && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 inline-block mt-2 mb-6">
                  Verification typically takes 1-3 business days.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={() => navigate("/login")} size="lg" className="rounded-full px-8">
                  Go to Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} size="lg" className="rounded-full px-8">
                  Back to Home
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
