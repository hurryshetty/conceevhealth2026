import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DoctorReview {
  id: string;
  name: string;
  area: string;
  rating: number;
  quote: string;
  image_url: string | null;
}

export interface DoctorData {
  id: string;
  slug: string;
  name: string;
  designation: string;
  experience: string;
  image_url: string | null;
  bio: string;
  qualifications: string[];
  specializations: string[];
  surgeries: string[];
  hospitals: string[];
  cities: string[];
  languages: string[];
  consultation_fee: string;
  reviews?: DoctorReview[];
}

export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as DoctorData[];
    },
  });
};

export const useDoctorBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["doctor", slug],
    queryFn: async () => {
      const { data: doctor, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!doctor) return null;

      const { data: reviews } = await supabase
        .from("doctor_reviews")
        .select("*")
        .eq("doctor_id", doctor.id)
        .order("created_at");

      return {
        ...doctor,
        reviews: reviews || [],
      } as DoctorData;
    },
    enabled: !!slug,
  });
};
