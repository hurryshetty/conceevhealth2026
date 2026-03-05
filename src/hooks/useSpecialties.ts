import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export const useSpecialties = () => {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Specialty[];
    },
  });
};
