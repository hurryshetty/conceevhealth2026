import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { StatusBadge } from "./AdminVerification";
import { useCities, useAreas } from "@/hooks/useLocations";

interface LocationForm {
  name: string;
  areas: string[];
  city_id: string;
  surgeries: string;
}

const emptyForm: LocationForm = { name: "", areas: [], city_id: "", surgeries: "" };

const AdminLocations = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cities = [] } = useCities();
  const { data: areas = [] } = useAreas(form.city_id || undefined);

  const { data: locations = [] } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*, cities(name)")
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

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (l: any) => {
    setEditId(l.id);
    setForm({
      name: l.name,
      areas: l.areas || [],
      city_id: l.city_id,
      surgeries: (l.surgeries || []).join(", "),
    });
    setDialogOpen(true);
  };

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
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hospitals found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Hospital" : "Add Hospital"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={form.city_id}
                onValueChange={(v) => setForm({ ...form, city_id: v, areas: [] })}
              >
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Areas
                {form.city_id && areas.length === 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">(no areas configured for this city — add them in Settings)</span>
                )}
                {!form.city_id && (
                  <span className="ml-2 text-xs text-muted-foreground">(select a city first)</span>
                )}
              </Label>
              {form.city_id && areas.length > 0 && (
                <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1.5">
                  {areas.map((area) => (
                    <label
                      key={area.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted px-1 py-0.5 rounded"
                    >
                      <Checkbox
                        checked={form.areas.includes(area.name)}
                        onCheckedChange={() => toggleArea(area.name)}
                      />
                      {area.name}
                    </label>
                  ))}
                </div>
              )}
              {form.areas.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {form.areas.join(", ")}
                </p>
              )}
            </div>

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
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLocations;
