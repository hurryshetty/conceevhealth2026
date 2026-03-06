import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpecialties } from "@/hooks/useSpecialties";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageForm {
  slug: string;
  title: string;
  description: string;
  price: string;
  cities: string;
  tag: string;
  specialty_id: string;
  icon_name: string;
  success_rate: string;
  total_patients: string;
  avg_rating: string;
  duration: string;
  recovery: string;
  overview: string;
  includes: string[];         // one item per line
  available_hospitals: string[];
  features: string[];
}

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

const emptyForm: PackageForm = {
  slug: "", title: "", description: "", price: "", cities: "", tag: "",
  specialty_id: "", icon_name: "Stethoscope", success_rate: "", total_patients: "",
  avg_rating: "0", duration: "", recovery: "", overview: "",
  includes: [], available_hospitals: [], features: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminPackages = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [customFeature, setCustomFeature] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: specialties = [] } = useSpecialties();

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: packages = [] } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, specialties(name)")
        .order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  // ── Save ──────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (f: PackageForm) => {
      const payload = {
        slug: f.slug,
        title: f.title,
        description: f.description,
        price: f.price,
        cities: f.cities.split(",").map((c) => c.trim()).filter(Boolean),
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
      if (editId) {
        const { error } = await supabase.from("packages").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setDialogOpen(false);
      toast({ title: editId ? "Package updated" : "Package created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast({ title: "Package deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Open ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setCustomFeature("");
    setDialogOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditId(pkg.id);
    setForm({
      slug: pkg.slug ?? "",
      title: pkg.title ?? "",
      description: pkg.description ?? "",
      price: pkg.price ?? "",
      cities: (pkg.cities ?? []).join(", "),
      tag: pkg.tag ?? "",
      specialty_id: pkg.specialty_id ?? "",
      icon_name: pkg.icon_name ?? "Stethoscope",
      success_rate: pkg.success_rate ?? "",
      total_patients: pkg.total_patients ?? "",
      avg_rating: String(pkg.avg_rating ?? 0),
      duration: pkg.duration ?? "",
      recovery: pkg.recovery ?? "",
      overview: pkg.overview ?? "",
      includes: Array.isArray(pkg.includes) ? pkg.includes : [],
      available_hospitals: Array.isArray(pkg.available_hospitals) ? pkg.available_hospitals : [],
      features: Array.isArray(pkg.features) ? pkg.features : [],
    });
    setCustomFeature("");
    setDialogOpen(true);
  };

  // ── Feature helpers ───────────────────────────────────────────────────────

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

  const filtered = packages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.specialties?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Packages</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Package</Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cities</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.title}</TableCell>
                  <TableCell>{pkg.specialties?.name ?? "-"}</TableCell>
                  <TableCell>{pkg.price}</TableCell>
                  <TableCell>{(pkg.cities ?? []).join(", ")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(pkg.features ?? []).length} feature{(pkg.features ?? []).length !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(pkg)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(pkg.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No packages found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editId ? "Edit Package" : "Add Package"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
            <Tabs defaultValue="basic" className="mt-2">
              <TabsList className="grid grid-cols-5 w-full mb-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="includes">Included</TabsTrigger>
                <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              {/* ── Tab: Basic Info ──────────────────────────────────── */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug *</Label>
                    <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. ivf-treatment" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price *</Label>
                    <Input required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹1,20,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                      <SelectContent>
                        {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tag</Label>
                    <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Most Popular, Advanced" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cities (comma-separated)</Label>
                    <Input value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} placeholder="Bangalore, Hyderabad" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4–6 weeks" />
                  </div>
                  <div className="space-y-2">
                    <Label>Recovery Time</Label>
                    <Input value={form.recovery} onChange={(e) => setForm({ ...form, recovery: e.target.value })} placeholder="e.g. 1–2 days" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One or two lines shown on the package card" />
                </div>
              </TabsContent>

              {/* ── Tab: Overview ────────────────────────────────────── */}
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <Label>Package Overview</Label>
                  <p className="text-xs text-muted-foreground">Detailed description shown on the package detail page</p>
                  <Textarea
                    rows={10}
                    value={form.overview}
                    onChange={(e) => setForm({ ...form, overview: e.target.value })}
                    placeholder="Describe the full treatment process, who it is for, what to expect, and the benefits in detail..."
                  />
                </div>

                {/* Features / Checkboxes */}
                <div className="space-y-3 pt-2">
                  <Label>Package Features</Label>
                  <p className="text-xs text-muted-foreground">Select all that apply to this package</p>
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="pt-1">
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

                  {/* Show custom (non-preset) features */}
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
              </TabsContent>

              {/* ── Tab: What's Included ─────────────────────────────── */}
              <TabsContent value="includes" className="space-y-4">
                <p className="text-sm text-muted-foreground">List everything included in this package — each item appears as a bullet point on the detail page.</p>
                <ListEditor
                  label="What's Included"
                  items={form.includes}
                  placeholder="e.g. Initial consultation with fertility specialist"
                  onChange={(items) => setForm({ ...form, includes: items })}
                />
                {form.includes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                    No items added yet. Type an item and press Enter or click +
                  </div>
                )}
              </TabsContent>

              {/* ── Tab: Available Hospitals ─────────────────────────── */}
              <TabsContent value="hospitals" className="space-y-4">
                <p className="text-sm text-muted-foreground">List the hospitals where this treatment is available. Shown on the package detail page.</p>
                <ListEditor
                  label="Available Hospitals"
                  items={form.available_hospitals}
                  placeholder="e.g. Conceev Fertility Centre, Bangalore"
                  onChange={(items) => setForm({ ...form, available_hospitals: items })}
                />
                {form.available_hospitals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                    No hospitals added yet. Type a hospital name and press Enter or click +
                  </div>
                )}
              </TabsContent>

              {/* ── Tab: Stats ───────────────────────────────────────── */}
              <TabsContent value="stats" className="space-y-4">
                <p className="text-sm text-muted-foreground">These stats appear on the package card and detail page to build patient trust.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Success Rate</Label>
                    <Input value={form.success_rate} onChange={(e) => setForm({ ...form, success_rate: e.target.value })} placeholder="e.g. 75%" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Patients</Label>
                    <Input value={form.total_patients} onChange={(e) => setForm({ ...form, total_patients: e.target.value })} placeholder="e.g. 2,400+" />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Rating (0–5)</Label>
                    <Input type="number" step="0.1" min="0" max="5" value={form.avg_rating} onChange={(e) => setForm({ ...form, avg_rating: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon Name</Label>
                    <Input value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} placeholder="e.g. Stethoscope, Heart, Activity" />
                  </div>
                </div>

                {/* Preview */}
                {(form.success_rate || form.total_patients) && (
                  <div className="mt-4 p-4 bg-accent rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Preview</p>
                    <div className="flex gap-6 text-sm">
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
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editId ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;
