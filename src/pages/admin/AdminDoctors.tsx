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

interface DoctorForm {
  slug: string; name: string; designation: string; experience: string; image_url: string;
  bio: string; qualifications: string; specializations: string; surgeries: string;
  hospitals: string; cities: string; languages: string; consultation_fee: string;
}

const emptyForm: DoctorForm = {
  slug: "", name: "", designation: "", experience: "", image_url: "",
  bio: "", qualifications: "", specializations: "", surgeries: "",
  hospitals: "", cities: "", languages: "", consultation_fee: "",
};

const AdminDoctors = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctors = [] } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: DoctorForm) => {
      const toArr = (s: string) => s.split(",").map((c) => c.trim()).filter(Boolean);
      const payload = {
        slug: f.slug, name: f.name, designation: f.designation, experience: f.experience,
        image_url: f.image_url || null, bio: f.bio, qualifications: toArr(f.qualifications),
        specializations: toArr(f.specializations), surgeries: toArr(f.surgeries),
        hospitals: toArr(f.hospitals), cities: toArr(f.cities), languages: toArr(f.languages),
        consultation_fee: f.consultation_fee,
      };
      if (editId) {
        const { error } = await supabase.from("doctors").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("doctors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setDialogOpen(false);
      toast({ title: editId ? "Doctor updated" : "Doctor created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast({ title: "Doctor deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (d: any) => {
    setEditId(d.id);
    setForm({
      slug: d.slug, name: d.name, designation: d.designation, experience: d.experience,
      image_url: d.image_url || "", bio: d.bio, qualifications: (d.qualifications || []).join(", "),
      specializations: (d.specializations || []).join(", "), surgeries: (d.surgeries || []).join(", "),
      hospitals: (d.hospitals || []).join(", "), cities: (d.cities || []).join(", "),
      languages: (d.languages || []).join(", "), consultation_fee: d.consultation_fee,
    });
    setDialogOpen(true);
  };

  const filtered = doctors.filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Doctors</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Doctor</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Cities</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.designation}</TableCell>
                <TableCell>{d.experience}</TableCell>
                <TableCell>{(d.cities || []).join(", ")}</TableCell>
                <TableCell>{d.consultation_fee}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Doctor" : "Add Doctor"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Experience</Label><Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Consultation Fee</Label><Input value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div className="space-y-2"><Label>Cities (comma-separated)</Label><Input value={form.cities} onChange={(e) => setForm({ ...form, cities: e.target.value })} /></div>
              <div className="space-y-2"><Label>Languages (comma-separated)</Label><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><Label>Qualifications (comma-separated)</Label><Textarea value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} /></div>
            <div className="space-y-2"><Label>Specializations (comma-separated)</Label><Textarea value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} /></div>
            <div className="space-y-2"><Label>Surgeries (comma-separated)</Label><Input value={form.surgeries} onChange={(e) => setForm({ ...form, surgeries: e.target.value })} /></div>
            <div className="space-y-2"><Label>Hospitals (comma-separated)</Label><Input value={form.hospitals} onChange={(e) => setForm({ ...form, hospitals: e.target.value })} /></div>
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

export default AdminDoctors;
