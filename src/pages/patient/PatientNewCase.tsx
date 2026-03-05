import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const PatientNewCase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    specialty_id: "",
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data } = await supabase.from("specialties").select("id, name").order("sort_order");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("patient_cases").insert({
        title: form.title,
        description: form.description,
        specialty_id: form.specialty_id || null,
        patient_id: user!.id,
        case_number: "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Case submitted!", description: "Our team will review and reach out to you soon." });
      navigate("/patient/cases");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="max-w-xl">
      <Button variant="ghost" onClick={() => navigate("/patient")} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Submit a New Case</h1>
      <p className="text-muted-foreground mb-8">
        Tell us about the treatment or procedure you're seeking. Our coordinators will review and get back to you within 24 hours.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
        className="space-y-5 bg-card border border-border rounded-xl p-6"
      >
        <div className="space-y-2">
          <Label>What treatment are you looking for? *</Label>
          <Input
            required
            placeholder="e.g. IVF Treatment, Hip Replacement Surgery"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Medical Specialty</Label>
          <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Describe your condition / requirements</Label>
          <Textarea
            rows={5}
            placeholder="Share any relevant medical history, current symptoms, previous treatments, or specific requirements..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Submitting..." : "Submit Case"}
        </Button>
      </form>
    </div>
  );
};

export default PatientNewCase;
