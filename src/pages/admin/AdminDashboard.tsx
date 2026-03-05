import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, UserRound, MapPin, Layers, MessageSquare } from "lucide-react";

const AdminDashboard = () => {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [packages, doctors, locations, specialties, leads] = await Promise.all([
        supabase.from("packages").select("id", { count: "exact", head: true }),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("locations").select("id", { count: "exact", head: true }),
        supabase.from("specialties").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);
      return {
        packages: packages.count || 0,
        doctors: doctors.count || 0,
        locations: locations.count || 0,
        specialties: specialties.count || 0,
        leads: leads.count || 0,
      };
    },
  });

  const cards = [
    { label: "Packages", count: counts?.packages ?? 0, icon: Package, color: "text-blue-600" },
    { label: "Doctors", count: counts?.doctors ?? 0, icon: UserRound, color: "text-green-600" },
    { label: "Locations", count: counts?.locations ?? 0, icon: MapPin, color: "text-orange-600" },
    { label: "Specialties", count: counts?.specialties ?? 0, icon: Layers, color: "text-purple-600" },
    { label: "Leads", count: counts?.leads ?? 0, icon: MessageSquare, color: "text-rose-600" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border p-6">
            <c.icon className={`h-8 w-8 ${c.color} mb-3`} />
            <p className="text-3xl font-bold text-foreground">{c.count}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
