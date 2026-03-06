import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PackageReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
}

export interface PackageData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  cities: string[];
  tag: string | null;
  specialty_id: string | null;
  icon_name: string;
  success_rate: string | null;
  total_patients: string | null;
  avg_rating: number;
  duration: string | null;
  recovery: string | null;
  includes: string[];
  overview: string | null;
  available_hospitals: string[];
  features: string[];
  reviews?: PackageReview[];
  specialty_name?: string;
}

export const usePackages = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, specialties(name)")
        .order("created_at");
      if (error) throw error;
      return (data as any[]).map((p) => ({
        ...p,
        specialty_name: p.specialties?.name || "",
      })) as PackageData[];
    },
  });
};

export const usePackageBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["package", slug],
    queryFn: async () => {
      const { data: pkg, error } = await supabase
        .from("packages")
        .select("*, specialties(name)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!pkg) return null;

      const { data: reviews } = await supabase
        .from("package_reviews")
        .select("*")
        .eq("package_id", pkg.id)
        .order("created_at");

      return {
        ...pkg,
        specialty_name: (pkg as any).specialties?.name || "",
        reviews: reviews || [],
      } as PackageData;
    },
    enabled: !!slug,
  });
};
