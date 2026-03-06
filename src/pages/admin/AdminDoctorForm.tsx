import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { useSpecialties } from "@/hooks/useSpecialties";
import { useCities } from "@/hooks/useLocations";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DESIGNATION_OPTIONS = [
  "Fertility Specialist",
  "Gynecologist & Obstetrician",
  "Reproductive Medicine Specialist",
  "Laparoscopic Surgeon",
  "Endocrinologist",
  "Senior Fertility Consultant",
  "Chief Fertility Consultant",
  "IVF Specialist",
  "Urologist",
  "Andrologist",
  "Senior Consultant",
  "Consultant Gynecologist",
  "Consultant Obstetrician",
  "Fetal Medicine Specialist",
  "Perinatologist",
];

const EXPERIENCE_OPTIONS = [
  "1 Year", "2 Years", "3 Years", "4 Years", "5 Years",
  "6 Years", "7 Years", "8 Years", "10 Years", "12 Years",
  "15 Years", "18 Years", "20 Years", "20+ Years", "25+ Years",
];

const LANGUAGE_OPTIONS = [
  "English", "Hindi", "Telugu", "Kannada", "Tamil",
  "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DoctorForm {
  slug: string;
  name: string;
  designation: string;
  experience: string;
  image_url: string;
  bio: string;
  consultation_fee: string;
  qualifications: string[];
  specializations: string[];
  surgeries: string[];
  hospitals: string[];
  cities: string[];
  languages: string[];
}

const emptyForm: DoctorForm = {
  slug: "", name: "", designation: "", experience: "", image_url: "",
  bio: "", consultation_fee: "",
  qualifications: [], specializations: [], surgeries: [],
  hospitals: [], cities: [], languages: [],
};

// ─── List Editor ───────────────────────────────────────────────────────────────

const ListEditor = ({
  label, items, placeholder, onChange,
}: {
  label: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="outline" onClick={add} className="flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-2 bg-accent rounded-lg px-3 py-2 text-sm">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Checkbox Group ────────────────────────────────────────────────────────────

const CheckboxGroup = ({
  label, hint, options, selected, onToggle,
}: {
  label: string;
  hint?: string;
  options: { id: string; label: string; sub?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) => (
  <div className="space-y-3">
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    {options.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
              selected.includes(opt.label)
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50"
            }`}
          >
            <input
              type="checkbox"
              className="accent-primary flex-shrink-0"
              checked={selected.includes(opt.label)}
              onChange={() => onToggle(opt.label)}
            />
            <span>
              <span className="font-medium text-foreground block">{opt.label}</span>
              {opt.sub && <span className="text-muted-foreground text-xs">{opt.sub}</span>}
            </span>
          </label>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground italic">No options found.</p>
    )}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminDoctorForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const set = (field: keyof DoctorForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── Data sources ──────────────────────────────────────────────────────────

  const { data: specialties = [] } = useSpecialties();
  const { data: cities = [] } = useCities();

  const { data: locationsList = [] } = useQuery({
    queryKey: ["locations-for-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, area")
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string; area: string }[];
    },
  });

  // ── Fetch existing doctor for edit ────────────────────────────────────────

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-doctor", id],
    enabled: isEdit,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (existing) {
      setForm({
        slug: existing.slug ?? "",
        name: existing.name ?? "",
        designation: existing.designation ?? "",
        experience: existing.experience ?? "",
        image_url: existing.image_url ?? "",
        bio: existing.bio ?? "",
        consultation_fee: existing.consultation_fee ?? "",
        qualifications: Array.isArray(existing.qualifications) ? existing.qualifications : [],
        specializations: Array.isArray(existing.specializations) ? existing.specializations : [],
        surgeries: Array.isArray(existing.surgeries) ? existing.surgeries : [],
        hospitals: Array.isArray(existing.hospitals) ? existing.hospitals : [],
        cities: Array.isArray(existing.cities) ? existing.cities : [],
        languages: Array.isArray(existing.languages) ? existing.languages : [],
      });
    }
  }, [existing]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (f: DoctorForm) => {
      const payload = {
        slug: f.slug,
        name: f.name,
        designation: f.designation,
        experience: f.experience,
        image_url: f.image_url || null,
        bio: f.bio,
        consultation_fee: f.consultation_fee,
        qualifications: f.qualifications,
        specializations: f.specializations,
        surgeries: f.surgeries,
        hospitals: f.hospitals,
        cities: f.cities,
        languages: f.languages,
      };
      if (isEdit) {
        const { error } = await supabase.from("doctors").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("doctors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      toast({ title: isEdit ? "Doctor updated" : "Doctor created" });
      navigate("/admin/doctors");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Toggle helpers ────────────────────────────────────────────────────────

  const toggle = (field: "cities" | "languages" | "hospitals" | "specializations") =>
    (value: string) =>
      setForm((f) => ({
        ...f,
        [field]: f[field].includes(value)
          ? f[field].filter((v) => v !== value)
          : [...f[field], value],
      }));

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading doctor...
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/doctors")} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {isEdit ? "Edit Doctor" : "Add New Doctor"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update the doctor's profile details" : "Fill in the details to create a new doctor profile"}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="specializations">Specializations</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          </TabsList>

          {/* ── Tab: Basic Info ──────────────────────────────────────────── */}
          <TabsContent value="basic">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Priya Sharma" />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="dr-priya-sharma" />
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label>Designation *</Label>
                  <Select value={form.designation || "__none"} onValueChange={(v) => set("designation", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Select...</SelectItem>
                      {DESIGNATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label>Experience *</Label>
                  <Select value={form.experience || "__none"} onValueChange={(v) => set("experience", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Select...</SelectItem>
                      {EXPERIENCE_OPTIONS.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Consultation Fee */}
                <div className="space-y-2">
                  <Label>Consultation Fee *</Label>
                  <Input required value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)} placeholder="e.g. ₹800" />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label>Profile Image URL</Label>
                  <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." />
                </div>
              </div>

              {/* Cities checkboxes */}
              <CheckboxGroup
                label="Available Cities"
                hint="Select all cities where this doctor practises"
                options={cities.map((c) => ({ id: c.id, label: c.name }))}
                selected={form.cities}
                onToggle={toggle("cities")}
              />
              {form.cities.length > 0 && (
                <p className="text-xs text-muted-foreground -mt-1">Selected: {form.cities.join(", ")}</p>
              )}

              {/* Languages checkboxes */}
              <div className="space-y-3 border-t border-border pt-5">
                <div>
                  <Label>Languages Spoken</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Select all languages the doctor speaks</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label
                      key={lang}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                        form.languages.includes(lang)
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={form.languages.includes(lang)}
                        onChange={() => toggle("languages")(lang)}
                      />
                      <span className="font-medium text-foreground">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: About ───────────────────────────────────────────────── */}
          <TabsContent value="about">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="space-y-2">
                <Label>Doctor Bio *</Label>
                <p className="text-xs text-muted-foreground">Shown on the doctor's profile page under "About"</p>
                <Textarea
                  rows={12}
                  required
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Describe the doctor's background, expertise, approach to patient care, achievements, and any notable experience..."
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Qualifications ──────────────────────────────────────── */}
          <TabsContent value="qualifications">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Add each qualification as a separate item — degrees, fellowships, certifications.
              </p>
              <ListEditor
                label="Qualifications"
                items={form.qualifications}
                placeholder="e.g. MBBS, MS (Obstetrics & Gynecology), DNB"
                onChange={(items) => set("qualifications", items)}
              />
              {form.qualifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No qualifications added yet. Type one and press Enter or click +
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Specializations ─────────────────────────────────────── */}
          <TabsContent value="specializations">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              {/* From specialties table */}
              <CheckboxGroup
                label="Select Specializations"
                hint="Choose from available specialties"
                options={specialties.map((s) => ({ id: s.id, label: s.name }))}
                selected={form.specializations}
                onToggle={toggle("specializations")}
              />

              {/* Custom specializations */}
              <div className="border-t border-border pt-5">
                <ListEditor
                  label="Add Custom Specialization"
                  items={form.specializations.filter(
                    (s) => !specialties.some((sp) => sp.name === s)
                  )}
                  placeholder="e.g. Advanced Laparoscopy"
                  onChange={(customItems) => {
                    const presetSelected = form.specializations.filter((s) =>
                      specialties.some((sp) => sp.name === s)
                    );
                    set("specializations", [...presetSelected, ...customItems]);
                  }}
                />
              </div>

              {/* Surgeries performed */}
              <div className="border-t border-border pt-5">
                <ListEditor
                  label="Surgeries Performed"
                  items={form.surgeries}
                  placeholder="e.g. IVF, Hysteroscopy, Laparoscopic Myomectomy"
                  onChange={(items) => set("surgeries", items)}
                />
                {form.surgeries.length === 0 && (
                  <p className="text-sm text-muted-foreground italic mt-2">No surgeries added yet.</p>
                )}
              </div>

              {/* Summary chips */}
              {form.specializations.length > 0 && (
                <div className="bg-accent rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Selected Specializations ({form.specializations.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.specializations.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1 text-xs">
                        {s}
                        <button type="button" onClick={() => toggle("specializations")(s)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Hospitals ───────────────────────────────────────────── */}
          <TabsContent value="hospitals">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Select the hospitals where this doctor is available. Shown on the doctor's profile page.
              </p>

              {/* Hospital checkboxes from locations table */}
              {locationsList.length > 0 ? (
                <div className="space-y-3">
                  <Label>Select Hospitals</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {locationsList.map((loc) => (
                      <label
                        key={loc.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                          form.hospitals.includes(loc.name)
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary flex-shrink-0"
                          checked={form.hospitals.includes(loc.name)}
                          onChange={() => toggle("hospitals")(loc.name)}
                        />
                        <span>
                          <span className="font-medium text-foreground">{loc.name}</span>
                          {loc.area && (
                            <span className="text-muted-foreground text-xs block mt-0.5">{loc.area}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No hospitals found. Add locations first under Admin → Locations.
                </div>
              )}

              {/* Manual add */}
              <div className="border-t border-border pt-5">
                <ListEditor
                  label="Add Hospital Manually"
                  items={form.hospitals.filter(
                    (h) => !locationsList.some((loc) => loc.name === h)
                  )}
                  placeholder="e.g. Conceev Fertility Centre, Bangalore"
                  onChange={(manualItems) => {
                    const dbSelected = form.hospitals.filter((h) =>
                      locationsList.some((loc) => loc.name === h)
                    );
                    set("hospitals", [...dbSelected, ...manualItems]);
                  }}
                />
              </div>

              {/* Summary */}
              {form.hospitals.length > 0 && (
                <div className="bg-accent rounded-lg p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Selected ({form.hospitals.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.hospitals.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1 text-xs">
                        {h}
                        <button type="button" onClick={() => toggle("hospitals")(h)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky footer */}
        <div className="flex justify-end gap-3 mt-6 py-4 border-t border-border sticky bottom-0 bg-background">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/doctors")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Doctor" : "Create Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminDoctorForm;
