import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Globe, Map, Building, MapPin, ChevronRight, Search, Star } from "lucide-react";
import { useCountries, useStates, useCities, useAreas } from "@/hooks/useLocations";
import type { Country, State, City, Area } from "@/hooks/useLocations";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

/** Translate Postgres constraint errors into readable messages */
function friendlyError(e: any): string {
  const msg: string = e?.message || "";
  if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
    return "This name already exists. Please use a different name.";
  }
  if (msg.includes("foreign key")) {
    return "Cannot delete — it has associated records. Remove children first.";
  }
  return msg || "An unexpected error occurred.";
}

/** Simple per-field validation, returns map of field → error string */
function validateFields(fields: Record<string, { value: string; required?: boolean; minLen?: number; pattern?: RegExp; patternMsg?: string }>) {
  const errors: Record<string, string> = {};
  for (const [key, rule] of Object.entries(fields)) {
    if (rule.required && !rule.value.trim()) {
      errors[key] = "This field is required.";
    } else if (rule.minLen && rule.value.trim().length < rule.minLen) {
      errors[key] = `Must be at least ${rule.minLen} characters.`;
    } else if (rule.pattern && rule.value.trim() && !rule.pattern.test(rule.value.trim())) {
      errors[key] = rule.patternMsg || "Invalid format.";
    }
  }
  return errors;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ items }: { items: { label: string; sub?: string }[] }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
          <span className={i === items.length - 1 ? "text-foreground font-medium" : ""}>
            {item.label}
            {item.sub && <span className="text-xs text-muted-foreground ml-1">({item.sub})</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Field with error ─────────────────────────────────────────────────────────
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-destructive mt-1">{error}</p>;
}

// ─── Generic CRUD dialog ───────────────────────────────────────────────────────
function CrudDialog({
  open, onOpenChange, title, fields, onSave, saving, saveDisabled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saveDisabled?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-1">{fields}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving || saveDisabled}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ open, onOpenChange, label, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; label: string; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{label}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete it along with all child records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Countries ─────────────────────────────────────────────────────────────────
function CountriesSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: countries = [] } = useCountries();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string; code: string }>({
    open: false, name: "", code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);

  const openAdd = () => { setDialog({ open: true, name: "", code: "" }); setErrors({}); };
  const openEdit = (c: Country) => { setDialog({ open: true, id: c.id, name: c.name, code: c.code || "" }); setErrors({}); };

  const validate = () => {
    const errs = validateFields({
      name: { value: dialog.name, required: true, minLen: 2 },
      code: { value: dialog.code, pattern: /^[A-Z]{0,3}$/, patternMsg: "Use 2-3 uppercase letters (e.g. IN, US)." },
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: dialog.name.trim(), code: dialog.code.trim().toUpperCase() || null };
      if (dialog.id) {
        const { error } = await supabase.from("countries").update(payload).eq("id", dialog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("countries").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      setDialog({ open: false, name: "", code: "" });
      toast({ title: dialog.id ? "Country updated" : "Country added" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("countries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      setDeleteTarget(null);
      toast({ title: "Country deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search countries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <p className="text-sm text-muted-foreground ml-auto">{filtered.length} / {countries.length}</p>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Country
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  {c.code
                    ? <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c.code}</span>
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No countries found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => { setDialog((d) => ({ ...d, open: v })); setErrors({}); }}
        title={dialog.id ? "Edit Country" : "Add Country"}
        saving={saveMutation.isPending}
        onSave={() => { if (validate()) saveMutation.mutate(); }}
        fields={
          <>
            <div className="space-y-1">
              <Label>Country Name <span className="text-destructive">*</span></Label>
              <Input
                value={dialog.name}
                onChange={(e) => { setDialog((d) => ({ ...d, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                placeholder="India"
                className={errors.name ? "border-destructive" : ""}
              />
              <FieldError error={errors.name} />
            </div>
            <div className="space-y-1">
              <Label>Country Code <span className="text-muted-foreground text-xs">(optional, ISO 2–3 letters)</span></Label>
              <Input
                value={dialog.code}
                onChange={(e) => { setDialog((d) => ({ ...d, code: e.target.value.toUpperCase() })); setErrors((er) => ({ ...er, code: "" })); }}
                placeholder="IN"
                maxLength={3}
                className={errors.code ? "border-destructive" : ""}
              />
              <FieldError error={errors.code} />
            </div>
          </>
        }
      />
      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          label={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

// ─── States ────────────────────────────────────────────────────────────────────
function StatesSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: countries = [] } = useCountries();
  const [countryId, setCountryId] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: states = [] } = useStates(countryId || undefined);
  const selectedCountry = countries.find((c) => c.id === countryId);
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string }>({ open: false, name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<State | null>(null);

  const openAdd = () => { setDialog({ open: true, name: "" }); setErrors({}); };
  const openEdit = (s: State) => { setDialog({ open: true, id: s.id, name: s.name }); setErrors({}); };

  const validate = () => {
    const errs = validateFields({ name: { value: dialog.name, required: true, minLen: 2 } });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!countryId) throw new Error("Select a country first.");
      const payload = { name: dialog.name.trim(), country_id: countryId };
      if (dialog.id) {
        const { error } = await supabase.from("states").update({ name: payload.name }).eq("id", dialog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("states").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["states", countryId] });
      setDialog({ open: false, name: "" });
      toast({ title: dialog.id ? "State updated" : "State added" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("states").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["states", countryId] });
      qc.invalidateQueries({ queryKey: ["cities"] });
      setDeleteTarget(null);
      toast({ title: "State deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const filtered = states.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Country <span className="text-destructive">*</span></Label>
        <Select value={countryId} onValueChange={(v) => { setCountryId(v); setSearch(""); }}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Choose a country to manage its states" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {countryId && (
        <>
          <Breadcrumb items={[{ label: selectedCountry?.name || "", sub: `${filtered.length} states` }]} />
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search states..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
            <p className="text-sm text-muted-foreground ml-auto">{filtered.length} / {states.length}</p>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add State
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State / Region Name</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No states found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => { setDialog((d) => ({ ...d, open: v })); setErrors({}); }}
        title={dialog.id ? "Edit State" : `Add State — ${selectedCountry?.name}`}
        saving={saveMutation.isPending}
        onSave={() => { if (validate()) saveMutation.mutate(); }}
        fields={
          <div className="space-y-1">
            <Label>State / Region Name <span className="text-destructive">*</span></Label>
            <Input
              value={dialog.name}
              onChange={(e) => { setDialog((d) => ({ ...d, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="Karnataka"
              className={errors.name ? "border-destructive" : ""}
            />
            <FieldError error={errors.name} />
          </div>
        }
      />
      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          label={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

// ─── Cities ────────────────────────────────────────────────────────────────────
function CitiesSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: countries = [] } = useCountries();
  const [countryId, setCountryId] = useState<string>("");
  const [stateId, setStateId] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: states = [] } = useStates(countryId || undefined);
  const { data: cities = [] } = useCities(stateId || undefined);
  const selectedCountry = countries.find((c) => c.id === countryId);
  const selectedState = states.find((s) => s.id === stateId);

  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string; slug: string }>({
    open: false, name: "", slug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);

  const openAdd = () => { setDialog({ open: true, name: "", slug: "" }); setErrors({}); };
  const openEdit = (c: City) => { setDialog({ open: true, id: c.id, name: c.name, slug: c.slug }); setErrors({}); };

  const validate = () => {
    const errs = validateFields({
      name: { value: dialog.name, required: true, minLen: 2 },
      slug: {
        value: dialog.slug,
        required: true,
        pattern: /^[a-z0-9-]+$/,
        patternMsg: "Only lowercase letters, numbers and hyphens allowed.",
      },
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!stateId) throw new Error("Select a state first.");
      const payload = {
        name: dialog.name.trim(),
        slug: dialog.slug.trim(),
        state_id: stateId,
        country_id: countryId || null,
      };
      if (dialog.id) {
        const { error } = await supabase.from("cities").update(payload).eq("id", dialog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cities").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
      setDialog({ open: false, name: "", slug: "" });
      toast({ title: dialog.id ? "City updated" : "City added" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
      qc.invalidateQueries({ queryKey: ["areas"] });
      setDeleteTarget(null);
      toast({ title: "City deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const featuredMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase.from("cities").update({ is_featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cities"] });
      qc.invalidateQueries({ queryKey: ["cities-featured"] });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Country <span className="text-destructive">*</span></Label>
          <Select value={countryId} onValueChange={(v) => { setCountryId(v); setStateId(""); setSearch(""); }}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State / Region <span className="text-destructive">*</span></Label>
          <Select value={stateId} onValueChange={(v) => { setStateId(v); setSearch(""); }} disabled={!countryId}>
            <SelectTrigger><SelectValue placeholder={countryId ? "Select state" : "Select country first"} /></SelectTrigger>
            <SelectContent>
              {states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {stateId && (
        <>
          <Breadcrumb items={[
            { label: selectedCountry?.name || "" },
            { label: selectedState?.name || "", sub: `${filtered.length} cities` },
          ]} />
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
            <p className="text-sm text-muted-foreground ml-auto">{filtered.length} / {cities.length}</p>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add City
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City Name</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead className="w-[120px] text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5" /> Homepage
                    </span>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><span className="font-mono text-xs text-muted-foreground">{c.slug}</span></TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => featuredMutation.mutate({ id: c.id, is_featured: !c.is_featured })}
                        disabled={featuredMutation.isPending}
                        title={c.is_featured ? "Remove from homepage" : "Show on homepage"}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          c.is_featured
                            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${c.is_featured ? "fill-yellow-500" : ""}`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No cities found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => { setDialog((d) => ({ ...d, open: v })); setErrors({}); }}
        title={dialog.id ? "Edit City" : `Add City — ${selectedState?.name}`}
        saving={saveMutation.isPending}
        onSave={() => { if (validate()) saveMutation.mutate(); }}
        fields={
          <>
            <div className="space-y-1">
              <Label>City Name <span className="text-destructive">*</span></Label>
              <Input
                value={dialog.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setDialog((d) => ({ ...d, name, slug: d.id ? d.slug : toSlug(name) }));
                  setErrors((er) => ({ ...er, name: "" }));
                }}
                placeholder="Bangalore"
                className={errors.name ? "border-destructive" : ""}
              />
              <FieldError error={errors.name} />
            </div>
            <div className="space-y-1">
              <Label>
                URL Slug <span className="text-destructive">*</span>
                <span className="text-muted-foreground text-xs ml-1">(auto-generated, editable)</span>
              </Label>
              <Input
                value={dialog.slug}
                onChange={(e) => { setDialog((d) => ({ ...d, slug: toSlug(e.target.value) })); setErrors((er) => ({ ...er, slug: "" })); }}
                placeholder="bangalore"
                className={`font-mono text-sm ${errors.slug ? "border-destructive" : ""}`}
              />
              <FieldError error={errors.slug} />
              {!errors.slug && dialog.slug && (
                <p className="text-xs text-muted-foreground">Used in URLs like /cities/{dialog.slug}</p>
              )}
            </div>
          </>
        }
      />
      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          label={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

// ─── Areas ─────────────────────────────────────────────────────────────────────
function AreasSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: cities = [] } = useCities();
  const [cityId, setCityId] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: areas = [] } = useAreas(cityId || undefined);
  const selectedCity = cities.find((c) => c.id === cityId);

  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string }>({ open: false, name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");

  const openAdd = () => { setDialog({ open: true, name: "" }); setErrors({}); };
  const openEdit = (a: Area) => { setDialog({ open: true, id: a.id, name: a.name }); setErrors({}); };

  const validate = () => {
    const errs = validateFields({ name: { value: dialog.name, required: true, minLen: 2 } });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!cityId) throw new Error("Select a city first.");
      const payload = { name: dialog.name.trim(), city_id: cityId };
      if (dialog.id) {
        const { error } = await supabase.from("areas").update({ name: payload.name }).eq("id", dialog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("areas").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas", cityId] });
      setDialog({ open: false, name: "" });
      toast({ title: dialog.id ? "Area updated" : "Area added" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas", cityId] });
      setDeleteTarget(null);
      toast({ title: "Area deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: friendlyError(e), variant: "destructive" }),
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!cityId) throw new Error("Select a city first.");
      const names = bulkText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length >= 2);
      if (names.length === 0) throw new Error("No valid area names found (min 2 characters each).");
      const rows = names.map((name) => ({ name, city_id: cityId }));
      const { error } = await supabase
        .from("areas")
        .upsert(rows, { onConflict: "city_id,name", ignoreDuplicates: true });
      if (error) throw error;
      return names.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["areas", cityId] });
      setBulkText("");
      setBulkOpen(false);
      setBulkError("");
      toast({ title: `${count} areas imported successfully` });
    },
    onError: (e: any) => setBulkError(friendlyError(e)),
  });

  const validateBulk = () => {
    const lines = bulkText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) { setBulkError("Paste at least one area name."); return false; }
    const short = lines.filter((l) => l.length < 2);
    if (short.length > 0) {
      setBulkError(`These entries are too short (min 2 chars): ${short.slice(0, 5).join(", ")}`);
      return false;
    }
    setBulkError("");
    return true;
  };

  const filtered = areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select City <span className="text-destructive">*</span></Label>
        <Select value={cityId} onValueChange={(v) => { setCityId(v); setSearch(""); }}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Choose a city to manage its areas" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {cityId && (
        <>
          <Breadcrumb items={[
            { label: selectedCity?.name || "", sub: `${areas.length} areas total` },
          ]} />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search areas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
            <p className="text-sm text-muted-foreground">{filtered.length} / {areas.length}</p>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => { setBulkOpen(true); setBulkText(""); setBulkError(""); }} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Bulk Import
              </Button>
              <Button size="sm" onClick={openAdd} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Area
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area Name</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(a)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(a)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      {areas.length === 0 ? "No areas yet — use Bulk Import to add many at once" : "No areas match your search"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Add / Edit area */}
      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => { setDialog((d) => ({ ...d, open: v })); setErrors({}); }}
        title={dialog.id ? "Edit Area" : `Add Area — ${selectedCity?.name}`}
        saving={saveMutation.isPending}
        onSave={() => { if (validate()) saveMutation.mutate(); }}
        fields={
          <div className="space-y-1">
            <Label>Area Name <span className="text-destructive">*</span></Label>
            <Input
              value={dialog.name}
              onChange={(e) => { setDialog((d) => ({ ...d, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
              placeholder="Koramangala"
              className={errors.name ? "border-destructive" : ""}
            />
            <FieldError error={errors.name} />
          </div>
        }
      />

      {/* Bulk import */}
      <Dialog open={bulkOpen} onOpenChange={(v) => { setBulkOpen(v); setBulkError(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Import Areas</DialogTitle>
            <p className="text-sm text-muted-foreground">
              City: <span className="font-medium text-foreground">{selectedCity?.name}</span>
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter one area name per line. Each must be at least 2 characters. Duplicates are automatically skipped.
            </p>
            <textarea
              className={`w-full h-44 border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background ${bulkError ? "border-destructive" : "border-border"}`}
              placeholder={"Koramangala\nIndiranagar\nWhitefield\nElectronic City"}
              value={bulkText}
              onChange={(e) => { setBulkText(e.target.value); setBulkError(""); }}
            />
            {bulkError && <p className="text-xs text-destructive">{bulkError}</p>}
            {bulkText && !bulkError && (
              <p className="text-xs text-muted-foreground">
                {bulkText.split("\n").filter((l) => l.trim().length >= 2).length} areas ready to import
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkOpen(false); setBulkError(""); }}>Cancel</Button>
            <Button
              onClick={() => { if (validateBulk()) bulkMutation.mutate(); }}
              disabled={bulkMutation.isPending || !bulkText.trim()}
            >
              {bulkMutation.isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          label={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AdminSettings = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Manage geographical hierarchy — Countries → States / Regions → Cities → Areas
      </p>
    </div>

    <Tabs defaultValue="areas">
      <TabsList className="mb-6 flex-wrap h-auto gap-1">
        <TabsTrigger value="countries" className="gap-2"><Globe className="h-4 w-4" /> Countries</TabsTrigger>
        <TabsTrigger value="states" className="gap-2"><Map className="h-4 w-4" /> States</TabsTrigger>
        <TabsTrigger value="cities" className="gap-2"><Building className="h-4 w-4" /> Cities</TabsTrigger>
        <TabsTrigger value="areas" className="gap-2"><MapPin className="h-4 w-4" /> Areas</TabsTrigger>
      </TabsList>

      <div className="bg-card border border-border rounded-xl p-6">
        <TabsContent value="countries"><CountriesSection /></TabsContent>
        <TabsContent value="states"><StatesSection /></TabsContent>
        <TabsContent value="cities"><CitiesSection /></TabsContent>
        <TabsContent value="areas"><AreasSection /></TabsContent>
      </div>
    </Tabs>
  </div>
);

export default AdminSettings;
