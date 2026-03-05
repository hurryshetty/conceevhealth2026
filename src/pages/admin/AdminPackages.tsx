import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpecialties } from "@/hooks/useSpecialties";

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
  includes: string;
  overview: string;
}

const emptyForm: PackageForm = {
  slug: "", title: "", description: "", price: "", cities: "", tag: "", specialty_id: "", icon_name: "Stethoscope",
  success_rate: "", total_patients: "", avg_rating: "0", duration: "", recovery: "", includes: "", overview: "",
};

const AdminPackages = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: specialties = [] } = useSpecialties();

  const { data: packages = [] } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*, specialties(name)").order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

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
        includes: f.includes.split(",").map((c) => c.trim()).filter(Boolean),
        overview: f.overview || null,
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

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (pkg: any) => {
    setEditId(pkg.id);
    setForm({
      slug: pkg.slug, title: pkg.title, description: pkg.description, price: pkg.price,
      cities: (pkg.cities || []).join(", "), tag: pkg.tag || "", specialty_id: pkg.specialty_id || "",
      icon_name: pkg.icon_name, success_rate: pkg.success_rate || "", total_patients: pkg.total_patients || "",
      avg_rating: String(pkg.avg_rating || 0), duration: pkg.duration || "", recovery: pkg.recovery || "",
      includes: (pkg.includes || []).join(", "), overview: pkg.overview || "",
    });
    setDialogOpen(true);
  };

  const filtered = packages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Packages</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Package</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Cities</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.title}</TableCell>
                <TableCell>{pkg.specialties?.name || "-"}</TableCell>
                <TableCell>{pkg.price}</TableCell>
                <TableCell>{(pkg.cities || []).join(", ")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(pkg)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(pkg.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Cities (comma-separated)</Label><Input value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tag</Label><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Popular" /></div>
              <div className="space-y-2"><Label>Icon Name</Label><Input value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Success Rate</Label><Input value={form.success_rate} onChange={(e) => setForm({ ...form, success_rate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Total Patients</Label><Input value={form.total_patients} onChange={(e) => setForm({ ...form, total_patients: e.target.value })} /></div>
              <div className="space-y-2"><Label>Avg Rating</Label><Input type="number" step="0.1" value={form.avg_rating} onChange={(e) => setForm({ ...form, avg_rating: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
              <div className="space-y-2"><Label>Recovery</Label><Input value={form.recovery} onChange={(e) => setForm({ ...form, recovery: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Includes (comma-separated)</Label><Textarea value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} /></div>
            <div className="space-y-2"><Label>Overview</Label><Textarea value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} rows={4} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;
