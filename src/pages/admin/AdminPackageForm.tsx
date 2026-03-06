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

const TAG_OPTIONS = [
  "Most Popular",
  "Advanced",
  "Premium",
  "Budget Friendly",
  "New",
  "Recommended",
  "High Success Rate",
  "Minimally Invasive",
];

const ICON_OPTIONS = [
  "Stethoscope", "Heart", "Activity", "Baby", "Brain", "Bone", "Eye",
  "Ear", "Syringe", "Pill", "Cross", "Shield", "Star", "Zap",
  "Thermometer", "Microscope", "FlaskConical", "Dna", "Waves", "Scan",
];

const DURATION_OPTIONS = [
  "1 day", "2–3 days", "3–5 days", "1 week", "2 weeks",
  "3–4 weeks", "4–6 weeks", "6–8 weeks", "2–3 months", "3–6 months",
];

const RECOVERY_OPTIONS = [
  "Same day", "1–2 days", "3–7 days", "1–2 weeks",
  "2–4 weeks", "1–2 months", "2–3 months",
];

const PRESET_FEATURES = [
  "EMI Options Available",
  "Free Second Opinion",
  "Dedicated Care Coordinator",
  "Insurance Assistance",
  "International Patient Support",
  "Post-Treatment Follow-up",
  "24/7 Support",
  "Airport Pickup & Drop",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PackageForm {
  slug: string;
  title: string;
  description: string;
  price: string;
  cities: string[];
  tag: string;
  specialty_id: string;
  icon_name: string;
  success_rate: string;
  total_patients: string;
  avg_rating: string;
  duration: string;
  recovery: string;
  overview: string;
  includes: string[];
  available_hospitals: string[];
  features: string[];
}

const emptyForm: PackageForm = {
  slug: "", title: "", description: "", price: "", cities: [], tag: "",
  specialty_id: "", icon_name: "Stethoscope", success_rate: "", total_patients: "",
  avg_rating: "0", duration: "", recovery: "", overview: "",
  includes: [], available_hospitals: [], features: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminPackageForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: specialties = [] } = useSpecialties();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [customFeature, setCustomFeature] = useState("");

  // ── Fetch cities (for city checkboxes) ───────────────────────────────────

  const { data: cities = [] } = useCities();

  // ── Fetch locations/hospitals directly ────────────────────────────────────

  const { data: locationsList = [] } = useQuery({
    queryKey: ["locations-for-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, area, city_id")
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string; area: string; city_id: string }[];
    },
  });

  // ── Fetch existing package for edit ───────────────────────────────────────

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-package", id],
    enabled: isEdit,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
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
        title: existing.title ?? "",
        description: existing.description ?? "",
        price: existing.price ?? "",
        cities: Array.isArray(existing.cities) ? existing.cities : [],
        tag: existing.tag ?? "",
        specialty_id: existing.specialty_id ?? "",
        icon_name: existing.icon_name ?? "Stethoscope",
        success_rate: existing.success_rate ?? "",
        total_patients: existing.total_patients ?? "",
        avg_rating: String(existing.avg_rating ?? 0),
        duration: existing.duration ?? "",
        recovery: existing.recovery ?? "",
        overview: existing.overview ?? "",
        includes: Array.isArray(existing.includes) ? existing.includes : [],
        available_hospitals: Array.isArray(existing.available_hospitals) ? existing.available_hospitals : [],
        features: Array.isArray(existing.features) ? existing.features : [],
      });
    }
  }, [existing]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (f: PackageForm) => {
      const payload = {
        slug: f.slug,
        title: f.title,
        description: f.description,
        price: f.price,
        cities: f.cities,
        tag: f.tag || null,
        specialty_id: f.specialty_id || null,
        icon_name: f.icon_name,
        success_rate: f.success_rate || null,
        total_patients: f.total_patients || null,
        avg_rating: parseFloat(f.avg_rating) || 0,
        duration: f.duration || null,
        recovery: f.recovery || null,
        overview: f.overview || null,
        includes: f.includes,
        available_hospitals: f.available_hospitals,
        features: f.features,
      };
      if (isEdit) {
        const { error } = await supabase.from("packages").update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package"] });
      toast({ title: isEdit ? "Package updated" : "Package created" });
      navigate("/admin/packages");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Hospital toggle ───────────────────────────────────────────────────────

  const toggleHospital = (hospitalName: string) => {
    setForm((f) => ({
      ...f,
      available_hospitals: f.available_hospitals.includes(hospitalName)
        ? f.available_hospitals.filter((h) => h !== hospitalName)
        : [...f.available_hospitals, hospitalName],
    }));
  };

  // ── City toggle ───────────────────────────────────────────────────────────

  const toggleCity = (city: string) => {
    setForm((f) => ({
      ...f,
      cities: f.cities.includes(city)
        ? f.cities.filter((c) => c !== city)
        : [...f.cities, city],
    }));
  };

  // ── Feature toggle ────────────────────────────────────────────────────────

  const toggleFeature = (feat: string) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  };

  const addCustomFeature = () => {
    const v = customFeature.trim();
    if (!v || form.features.includes(v)) return;
    setForm((f) => ({ ...f, features: [...f.features, v] }));
    setCustomFeature("");
  };

  // ── Field setter helper ───────────────────────────────────────────────────

  const set = (field: keyof PackageForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading package...
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/packages")}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {isEdit ? "Edit Package" : "Add New Package"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update the package details below" : "Fill in the details to create a new health package"}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="includes">Included</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* ── Tab: Basic Info ──────────────────────────────────────────── */}
          <TabsContent value="basic">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. IVF Treatment Package" />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. ivf-treatment" />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input required value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹1,20,000" />
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Select value={form.specialty_id} onValueChange={(v) => set("specialty_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag */}
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select value={form.tag || "__none"} onValueChange={(v) => set("tag", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select tag (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {TAG_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={form.icon_name} onValueChange={(v) => set("icon_name", v)}>
                    <SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={form.duration || "__none"} onValueChange={(v) => set("duration", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Not specified</SelectItem>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recovery */}
                <div className="space-y-2">
                  <Label>Recovery Time</Label>
                  <Select value={form.recovery || "__none"} onValueChange={(v) => set("recovery", v === "__none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select recovery time" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Not specified</SelectItem>
                      {RECOVERY_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Short Description</Label>
                <p className="text-xs text-muted-foreground">One or two lines shown on the package card</p>
                <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief summary of this package..." />
              </div>

              {/* Cities multi-select */}
              <div className="space-y-3">
                <Label>Available Cities</Label>
                <p className="text-xs text-muted-foreground">Select all cities where this package is offered</p>
                {cities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cities.map((city) => (
                      <label
                        key={city.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                          form.cities.includes(city.name)
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={form.cities.includes(city.name)}
                          onChange={() => toggleCity(city.name)}
                        />
                        <span className="font-medium text-foreground">{city.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No cities found. Add cities first.</p>
                )}
                {form.cities.length > 0 && (
                  <p className="text-xs text-muted-foreground">Selected: {form.cities.join(", ")}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Overview ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              {/* Overview text */}
              <div className="space-y-2">
                <Label>Package Overview</Label>
                <p className="text-xs text-muted-foreground">Detailed description shown on the package detail page</p>
                <Textarea
                  rows={10}
                  value={form.overview}
                  onChange={(e) => set("overview", e.target.value)}
                  placeholder="Describe the full treatment process, who it is for, what to expect, and the benefits in detail..."
                />
              </div>

              {/* Features checkboxes */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <Label>Package Features</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select all that apply to this package</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_FEATURES.map((feat) => (
                    <label
                      key={feat}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                        form.features.includes(feat)
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={form.features.includes(feat)}
                        onChange={() => toggleFeature(feat)}
                      />
                      {feat}
                    </label>
                  ))}
                </div>

                {/* Custom feature */}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Add a custom feature</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      placeholder="e.g. Yoga & Meditation Sessions"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomFeature(); } }}
                    />
                    <Button type="button" variant="outline" onClick={addCustomFeature} className="flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Custom features list */}
                {form.features.filter((f) => !PRESET_FEATURES.includes(f)).length > 0 && (
                  <div className="space-y-1.5">
                    {form.features.filter((f) => !PRESET_FEATURES.includes(f)).map((feat) => (
                      <div key={feat} className="flex items-center justify-between bg-accent rounded-lg px-3 py-2 text-sm">
                        <span>{feat}</span>
                        <button type="button" onClick={() => toggleFeature(feat)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: What's Included ───────────────────────────────────────── */}
          <TabsContent value="includes">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                List everything included in this package — each item appears as a bullet point on the detail page.
              </p>
              <ListEditor
                label="What's Included"
                items={form.includes}
                placeholder="e.g. Initial consultation with fertility specialist"
                onChange={(items) => set("includes", items)}
              />
              {form.includes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                  No items added yet. Type an item and press Enter or click +
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Available Hospitals ────────────────────────────────────── */}
          <TabsContent value="hospitals">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Select the hospitals where this treatment is available. Shown on the package detail page.
                </p>
              </div>

              {/* Hospital checkboxes from locations table */}
              {locationsList.length > 0 ? (
                <div className="space-y-3">
                  <Label>Select Hospitals</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {locationsList.map((loc) => (
                      <label
                        key={loc.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                          form.available_hospitals.includes(loc.name)
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-primary flex-shrink-0"
                          checked={form.available_hospitals.includes(loc.name)}
                          onChange={() => toggleHospital(loc.name)}
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

              {/* Manual add for hospitals not in the locations table */}
              <div className="border-t border-border pt-5">
                <ListEditor
                  label="Add Hospital Manually"
                  items={form.available_hospitals.filter(
                    (h) => !locationsList.some((loc) => loc.name === h)
                  )}
                  placeholder="e.g. Conceev Fertility Centre, Bangalore"
                  onChange={(manualItems) => {
                    const dbSelected = form.available_hospitals.filter((h) =>
                      locationsList.some((loc) => loc.name === h)
                    );
                    set("available_hospitals", [...dbSelected, ...manualItems]);
                  }}
                />
              </div>

              {/* Summary */}
              {form.available_hospitals.length > 0 && (
                <div className="bg-accent rounded-lg p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Selected ({form.available_hospitals.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.available_hospitals.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1 text-xs">
                        {h}
                        <button type="button" onClick={() => toggleHospital(h)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Stats ─────────────────────────────────────────────────── */}
          <TabsContent value="stats">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                These stats appear on the package card and detail page to build patient trust.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Success Rate</Label>
                  <Input value={form.success_rate} onChange={(e) => set("success_rate", e.target.value)} placeholder="e.g. 75%" />
                </div>
                <div className="space-y-2">
                  <Label>Total Patients</Label>
                  <Input value={form.total_patients} onChange={(e) => set("total_patients", e.target.value)} placeholder="e.g. 2,400+" />
                </div>
                <div className="space-y-2">
                  <Label>Average Rating (0–5)</Label>
                  <Input type="number" step="0.1" min="0" max="5" value={form.avg_rating} onChange={(e) => set("avg_rating", e.target.value)} />
                </div>
              </div>

              {/* Stats preview */}
              {(form.success_rate || form.total_patients || (form.avg_rating && parseFloat(form.avg_rating) > 0)) && (
                <div className="p-4 bg-accent rounded-xl">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Preview</p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    {form.success_rate && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">{form.success_rate}</p>
                        <p className="text-muted-foreground text-xs">Success Rate</p>
                      </div>
                    )}
                    {form.total_patients && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">{form.total_patients}</p>
                        <p className="text-muted-foreground text-xs">Patients Treated</p>
                      </div>
                    )}
                    {form.avg_rating && parseFloat(form.avg_rating) > 0 && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">★ {form.avg_rating}</p>
                        <p className="text-muted-foreground text-xs">Rating</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky footer actions */}
        <div className="flex justify-end gap-3 mt-6 py-4 border-t border-border sticky bottom-0 bg-background">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/packages")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Package" : "Create Package"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageForm;
