import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, MapPin, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "./AdminVerification";
import { useCountries, useStates, useCities, useAreas } from "@/hooks/useLocations";
import { cn } from "@/lib/utils";

interface LocationForm {
  name: string;
  country_id: string;
  state_id: string;
  city_id: string;
  areas: string[];
  surgeries: string;
  image_url: string;
}

const emptyForm: LocationForm = {
  name: "",
  country_id: "",
  state_id: "",
  city_id: "",
  areas: [],
  surgeries: "",
  image_url: "",
};

// ── Searchable Combobox ──────────────────────────────────────────────────────
interface ComboboxProps {
  value: string;
  onValueChange: (v: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const SearchableCombobox = ({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  emptyMessage = "No results found.",
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
            </span>
          ) : (
            <span className="truncate">{selected ? selected.name : placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onValueChange(opt.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === opt.id ? "opacity-100" : "opacity-0")}
                  />
                  {opt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const AdminLocations = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hierarchical data hooks
  const { data: countries = [], isLoading: loadingCountries } = useCountries();
  const { data: states = [], isLoading: loadingStates } = useStates(form.country_id || undefined);
  const { data: cities = [], isLoading: loadingCities } = useCities(form.state_id || undefined);
  const { data: areas = [], isLoading: loadingAreas } = useAreas(form.city_id || undefined);

  const { data: locations = [] } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*, cities(name, state_id, country_id, states(name), countries(name))")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: LocationForm) => {
      const payload = {
        name: f.name,
        areas: f.areas,
        city_id: f.city_id,
        surgeries: f.surgeries.split(",").map((s) => s.trim()).filter(Boolean),
        image_url: f.image_url || null,
      };
      if (editId) {
        const { error } = await supabase.from("locations").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("locations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogOpen(false);
      toast({ title: editId ? "Hospital updated" : "Hospital created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({ title: "Hospital deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("locations").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = async (l: any) => {
    setEditId(l.id);
    // Resolve country_id and state_id from the city's relations
    const city = l.cities;
    setForm({
      name: l.name,
      country_id: city?.country_id || "",
      state_id: city?.state_id || "",
      city_id: l.city_id,
      areas: l.areas || [],
      surgeries: (l.surgeries || []).join(", "),
      image_url: l.image_url || "",
    });
    setDialogOpen(true);
  };

  // Cascade resets
  const handleCountryChange = (v: string) =>
    setForm((f) => ({ ...f, country_id: v, state_id: "", city_id: "", areas: [] }));

  const handleStateChange = (v: string) =>
    setForm((f) => ({ ...f, state_id: v, city_id: "", areas: [] }));

  const handleCityChange = (v: string) =>
    setForm((f) => ({ ...f, city_id: v, areas: [] }));

  const toggleArea = (areaName: string) => {
    setForm((f) => ({
      ...f,
      areas: f.areas.includes(areaName)
        ? f.areas.filter((a) => a !== areaName)
        : [...f.areas, areaName],
    }));
  };

  const filtered = locations.filter((l: any) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.areas || []).some((a: string) => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Hospitals</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Hospital</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hospitals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Name</TableHead>
                <TableHead>Areas</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Surgeries</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(l.areas || []).length > 0 ? (
                        (l.areas || []).slice(0, 3).map((a: string) => (
                          <span key={a} className="inline-flex items-center gap-0.5 text-xs bg-muted px-1.5 py-0.5 rounded">
                            <MapPin className="h-2.5 w-2.5" />{a}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                      {(l.areas || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">+{l.areas.length - 3} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{l.cities?.name || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{(l.surgeries || []).join(", ")}</TableCell>
                  <TableCell><StatusBadge status={l.status || "DRAFT"} /></TableCell>
                  <TableCell>
                    <Switch
                      checked={!!l.is_published}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: l.id, is_published: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hospitals found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Hospital" : "Add Hospital"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">

            {/* Hospital Name */}
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter hospital name"
                required
              />
            </div>

            {/* Hospital Logo / Image */}
            <ImageUpload
              label="Hospital Logo / Image"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="hospitals"
            />

            {/* ── Location Hierarchy ── */}
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
              <p className="text-sm font-medium text-foreground">Location</p>

              {/* Country */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Country</Label>
                <SearchableCombobox
                  value={form.country_id}
                  onValueChange={handleCountryChange}
                  options={countries}
                  placeholder="Select country"
                  searchPlaceholder="Search countries..."
                  loading={loadingCountries}
                  emptyMessage="No countries available."
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  State / Region
                  {form.country_id && !loadingStates && states.length === 0 && (
                    <span className="ml-1 text-orange-500">(no states for this country)</span>
                  )}
                </Label>
                <SearchableCombobox
                  value={form.state_id}
                  onValueChange={handleStateChange}
                  options={states}
                  placeholder={form.country_id ? "Select state" : "Select a country first"}
                  searchPlaceholder="Search states..."
                  disabled={!form.country_id}
                  loading={loadingStates && !!form.country_id}
                  emptyMessage="No states available for this country."
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  City
                  {form.state_id && !loadingCities && cities.length === 0 && (
                    <span className="ml-1 text-orange-500">(no cities for this state)</span>
                  )}
                </Label>
                <SearchableCombobox
                  value={form.city_id}
                  onValueChange={handleCityChange}
                  options={cities}
                  placeholder={form.state_id ? "Select city" : "Select a state first"}
                  searchPlaceholder="Search cities..."
                  disabled={!form.state_id}
                  loading={loadingCities && !!form.state_id}
                  emptyMessage="No cities available for this state."
                />
              </div>

              {/* Areas */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Areas / Localities
                  {form.city_id && !loadingAreas && areas.length === 0 && (
                    <span className="ml-1 text-orange-500">(no areas — add them in Settings)</span>
                  )}
                </Label>

                {!form.city_id ? (
                  <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Select a city to see available areas
                  </div>
                ) : loadingAreas ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading areas...
                  </div>
                ) : areas.length > 0 ? (
                  <div className="border border-border rounded-lg bg-background max-h-44 overflow-y-auto">
                    {/* Search within areas */}
                    <div className="sticky top-0 bg-background border-b border-border px-3 py-2">
                      <AreaSearch areas={areas} selectedAreas={form.areas} onToggle={toggleArea} />
                    </div>
                  </div>
                ) : null}

                {form.areas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.areas.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full cursor-pointer hover:bg-primary/20"
                        onClick={() => toggleArea(a)}
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {a}
                        <span className="ml-0.5 opacity-60">×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Surgeries */}
            <div className="space-y-2">
              <Label>Surgeries (comma-separated)</Label>
              <Input
                value={form.surgeries}
                onChange={(e) => setForm({ ...form, surgeries: e.target.value })}
                placeholder="IVF, Hysterectomy, Laparoscopy"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending || !form.city_id || !form.name}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Inline Area Search (avoids re-render issues with parent state) ────────────
const AreaSearch = ({
  areas,
  selectedAreas,
  onToggle,
}: {
  areas: { id: string; name: string }[];
  selectedAreas: string[];
  onToggle: (name: string) => void;
}) => {
  const [q, setQ] = useState("");
  const filtered = q
    ? areas.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
    : areas;

  return (
    <>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search areas..."
        className="h-7 text-xs border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="space-y-0.5 px-1 py-1 max-h-32 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1 px-1">No areas match your search.</p>
        ) : (
          filtered.map((area) => (
            <label
              key={area.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted px-1 py-0.5 rounded"
            >
              <Checkbox
                checked={selectedAreas.includes(area.name)}
                onCheckedChange={() => onToggle(area.name)}
              />
              {area.name}
            </label>
          ))
        )}
      </div>
    </>
  );
};

export default AdminLocations;
