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
import { Plus, Pencil, Trash2, Globe, Map, Building, MapPin, ChevronRight } from "lucide-react";
import { useCountries, useStates, useCities, useAreas } from "@/hooks/useLocations";
import type { Country, State, City, Area } from "@/hooks/useLocations";

// ─── Breadcrumb trail ──────────────────────────────────────────────────────────
function Breadcrumb({ items }: { items: { label: string; sub?: string }[] }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          <span className={i === items.length - 1 ? "text-foreground font-medium" : ""}>
            {item.label}
            {item.sub && <span className="text-xs text-muted-foreground ml-1">({item.sub})</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Generic CRUD dialog ───────────────────────────────────────────────────────
function CrudDialog({
  open, onOpenChange, title, fields, onSave, saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4">{fields}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
  open, onOpenChange, label, onConfirm,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; label: string; onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{label}"?</AlertDialogTitle>
          <AlertDialogDescription>This will also delete all child records (states → cities → areas).</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string; code: string }>({ open: false, name: "", code: "" });
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: dialog.name.trim(), code: dialog.code.trim() || null };
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("countries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["countries"] });
      qc.invalidateQueries({ queryKey: ["states"] });
      qc.invalidateQueries({ queryKey: ["cities"] });
      setDeleteTarget(null);
      toast({ title: "Country deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{countries.length} countries</p>
        <Button size="sm" onClick={() => setDialog({ open: true, name: "", code: "" })} className="gap-1.5">
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
            {countries.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c.code || "—"}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, id: c.id, name: c.name, code: c.code || "" })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {countries.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No countries yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        title={dialog.id ? "Edit Country" : "Add Country"}
        saving={saveMutation.isPending}
        onSave={() => saveMutation.mutate()}
        fields={
          <>
            <div className="space-y-2">
              <Label>Country Name</Label>
              <Input value={dialog.name} onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value }))} placeholder="India" />
            </div>
            <div className="space-y-2">
              <Label>Country Code <span className="text-muted-foreground text-xs">(optional, e.g. IN)</span></Label>
              <Input value={dialog.code} onChange={(e) => setDialog((d) => ({ ...d, code: e.target.value }))} placeholder="IN" maxLength={3} />
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
  const { data: states = [] } = useStates(countryId || undefined);
  const selectedCountry = countries.find((c) => c.id === countryId);
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string }>({ open: false, name: "" });
  const [deleteTarget, setDeleteTarget] = useState<State | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!countryId) throw new Error("Select a country first");
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Filter by Country</Label>
        <Select value={countryId} onValueChange={setCountryId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {countryId && (
        <>
          <Breadcrumb items={[{ label: selectedCountry?.name || "" }]} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{states.length} states in {selectedCountry?.name}</p>
            <Button size="sm" onClick={() => setDialog({ open: true, name: "" })} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add State
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State Name</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {states.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, id: s.id, name: s.name })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {states.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No states yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        title={dialog.id ? "Edit State" : "Add State"}
        saving={saveMutation.isPending}
        onSave={() => saveMutation.mutate()}
        fields={
          <div className="space-y-2">
            <Label>State Name</Label>
            <Input value={dialog.name} onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value }))} placeholder="Karnataka" />
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
  const { data: states = [] } = useStates(countryId || undefined);
  const { data: cities = [] } = useCities(stateId || undefined);
  const selectedCountry = countries.find((c) => c.id === countryId);
  const selectedState = states.find((s) => s.id === stateId);
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string; slug: string }>({ open: false, name: "", slug: "" });
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);

  const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!stateId) throw new Error("Select a state first");
      const payload = {
        name: dialog.name.trim(),
        slug: dialog.slug.trim() || toSlug(dialog.name),
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={countryId} onValueChange={(v) => { setCountryId(v); setStateId(""); }}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select value={stateId} onValueChange={setStateId} disabled={!countryId}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
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
            { label: selectedState?.name || "" },
          ]} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{cities.length} cities in {selectedState?.name}</p>
            <Button size="sm" onClick={() => setDialog({ open: true, name: "", slug: "" })} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add City
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><span className="font-mono text-xs text-muted-foreground">{c.slug}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, id: c.id, name: c.name, slug: c.slug })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {cities.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No cities yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        title={dialog.id ? "Edit City" : "Add City"}
        saving={saveMutation.isPending}
        onSave={() => saveMutation.mutate()}
        fields={
          <>
            <div className="space-y-2">
              <Label>City Name</Label>
              <Input
                value={dialog.name}
                onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value, slug: d.id ? d.slug : toSlug(e.target.value) }))}
                placeholder="Bangalore"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug <span className="text-xs text-muted-foreground">(URL-friendly)</span></Label>
              <Input value={dialog.slug} onChange={(e) => setDialog((d) => ({ ...d, slug: e.target.value }))} placeholder="bangalore" />
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
  const { data: areas = [] } = useAreas(cityId || undefined);
  const selectedCity = cities.find((c) => c.id === cityId);
  const [dialog, setDialog] = useState<{ open: boolean; id?: string; name: string }>({ open: false, name: "" });
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!cityId) throw new Error("Select a city first");
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!cityId) throw new Error("Select a city first");
      const names = bulkText.split("\n").map((s) => s.trim()).filter(Boolean);
      const rows = names.map((name) => ({ name, city_id: cityId }));
      const { error } = await supabase.from("areas").upsert(rows, { onConflict: "city_id,name", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas", cityId] });
      setBulkText("");
      setBulkOpen(false);
      toast({ title: "Areas imported" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Filter by City</Label>
        <Select value={cityId} onValueChange={setCityId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {cityId && (
        <>
          <Breadcrumb items={[{ label: selectedCity?.name || "", sub: `${areas.length} areas` }]} />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{areas.length} areas in {selectedCity?.name}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Bulk Import
              </Button>
              <Button size="sm" onClick={() => setDialog({ open: true, name: "" })} className="gap-1.5">
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
                {areas.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, id: a.id, name: a.name })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(a)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {areas.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-6">No areas yet — add one or use Bulk Import</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Add/Edit area */}
      <CrudDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((d) => ({ ...d, open: v }))}
        title={dialog.id ? "Edit Area" : "Add Area"}
        saving={saveMutation.isPending}
        onSave={() => saveMutation.mutate()}
        fields={
          <div className="space-y-2">
            <Label>Area Name</Label>
            <Input value={dialog.name} onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value }))} placeholder="Koramangala" />
          </div>
        }
      />

      {/* Bulk import dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bulk Import Areas — {selectedCity?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Enter one area name per line. Duplicates will be skipped.</p>
            <textarea
              className="w-full h-40 border border-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder={"Koramangala\nIndiranagar\nWhitefield\nElectronic City"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isPending || !bulkText.trim()}>
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
const AdminSettings = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage geographical hierarchy: Countries → States → Cities → Areas</p>
      </div>

      <Tabs defaultValue="areas">
        <TabsList className="mb-6">
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
};

export default AdminSettings;
