import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface Location {
  id: string;
  city_id: string;
  name: string;
  area: string;
  surgeries: string[];
  city_name?: string;
}

export const useCities = () => {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as City[];
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*, cities(name)")
        .order("area");
      if (error) throw error;
      return (data as any[]).map((l) => ({
        ...l,
        city_name: l.cities?.name || "",
      })) as Location[];
    },
  });
};
