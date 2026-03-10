import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const surgeries = ["IVF", "IUI", "Hysterectomy", "Fibroid Surgery", "Ovarian Cyst Removal", "Normal Delivery", "C-Section", "Other"];

const countryCodes = [
  { code: "+91", flag: "🇮🇳", name: "India", maxLen: 10 },
  { code: "+1", flag: "🇺🇸", name: "US", maxLen: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", maxLen: 11 },
  { code: "+971", flag: "🇦🇪", name: "UAE", maxLen: 9 },
  { code: "+65", flag: "🇸🇬", name: "SG", maxLen: 8 },
];

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePage?: string;
}

const LeadFormModal = ({ open, onOpenChange, sourcePage = "homepage" }: LeadFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", surgery: "", location: "", query: "" });
  const [countryIdx, setCountryIdx] = useState(0);
  const [agreed, setAgreed] = useState(true);

  const selectedCountry = countryCodes[countryIdx];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.phone.trim() || !form.surgery || !form.location) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (form.phone.trim().length < selectedCountry.maxLen) {
      toast({ title: `Please enter a valid ${selectedCountry.maxLen}-digit number`, variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Please agree to Terms & Conditions", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim().slice(0, 100),
      phone: `${selectedCountry.code}${form.phone.trim()}`.slice(0, 15),
      procedure_interest: form.surgery,
      city: form.location,
      source_page: sourcePage,
      lead_type: "patient_enquiry",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Thank you! 🎉", description: "Our care coordinator will contact you shortly." });
      setForm({ firstName: "", lastName: "", phone: "", surgery: "", location: "", query: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Book Free Consultation</DialogTitle>
          <DialogDescription>Share your details and our care coordinator will reach out within 30 minutes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              maxLength={50}
            />
            <Input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              maxLength={50}
            />
          </div>
          <div className="flex gap-1">
            <Select value={String(countryIdx)} onValueChange={(v) => { setCountryIdx(Number(v)); setForm({ ...form, phone: "" }); }}>
              <SelectTrigger className="w-[80px] px-2">
                <SelectValue>{selectedCountry.flag} {selectedCountry.code}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((c, i) => (
                  <SelectItem key={c.code} value={String(i)}>{c.flag} {c.code} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Mobile Number *"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, selectedCountry.maxLen);
                setForm({ ...form, phone: val });
              }}
              maxLength={selectedCountry.maxLen}
              className="flex-1"
            />
          </div>
          <Select value={form.surgery} onValueChange={(v) => setForm({ ...form, surgery: v })}>
            <SelectTrigger><SelectValue placeholder="Surgery Looking For *" /></SelectTrigger>
            <SelectContent>
              {surgeries.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
            <SelectTrigger><SelectValue placeholder="Preferred Location *" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Share your query..."
            value={form.query}
            onChange={(e) => setForm({ ...form, query: e.target.value })}
            maxLength={500}
            className="min-h-[70px]"
          />
          <div className="flex items-start gap-2">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <label className="text-[11px] text-muted-foreground leading-tight cursor-pointer" onClick={() => setAgreed(!agreed)}>
              I agree to the Terms & Conditions and Privacy Policy
            </label>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? "Submitting..." : "Book Free Consultation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
