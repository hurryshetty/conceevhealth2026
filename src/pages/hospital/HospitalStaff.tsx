import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const HospitalStaff = () => {
  const { user } = useAuth();

  const { data: membership } = useQuery({
    queryKey: ["hospital-membership", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_members")
        .select("hospital_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["hospital-staff", membership?.hospital_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospital_members")
        .select("*, profiles!user_id(full_name)")
        .eq("hospital_id", membership!.hospital_id);
      return data ?? [];
    },
    enabled: !!membership?.hospital_id,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-6">Staff</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-muted-foreground p-6">Loading...</p>
        ) : staff.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center">No staff members found</p>
        ) : (
          <div className="divide-y divide-border">
            {staff.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.profiles?.full_name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge variant={s.member_role === "admin" ? "default" : "secondary"} className="capitalize">
                  {s.member_role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalStaff;
