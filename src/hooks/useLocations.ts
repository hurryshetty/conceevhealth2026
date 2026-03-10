import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Country {
  id: string;
  name: string;
  code: string | null;
}

export interface State {
  id: string;
  country_id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state_id?: string | null;
  country_id?: string | null;
  is_featured?: boolean;
}

export interface Area {
  id: string;
  city_id: string;
  name: string;
}

export interface Location {
  id: string;
  city_id: string;
  name: string;
  areas: string[];
  surgeries: string[];
  city_name?: string;
}

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Country[];
    },
  });
};

export const useStates = (countryId?: string) => {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: async () => {
      let q = supabase.from("states").select("*").order("name");
      if (countryId) q = q.eq("country_id", countryId);
      const { data, error } = await q;
      if (error) throw error;
      return data as State[];
    },
    enabled: true,
  });
};

export const useCities = (stateId?: string) => {
  return useQuery({
    queryKey: ["cities", stateId],
    queryFn: async () => {
      let q = supabase.from("cities").select("*").order("name");
      if (stateId) q = q.eq("state_id", stateId);
      const { data, error } = await q;
      if (error) throw error;
      return data as City[];
    },
    enabled: true,
  });
};

export const useAreas = (cityId?: string) => {
  return useQuery({
    queryKey: ["areas", cityId],
    queryFn: async () => {
      if (!cityId) return [];
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("city_id", cityId)
        .order("name");
      if (error) throw error;
      return data as Area[];
    },
    enabled: !!cityId,
  });
};

export const useFeaturedCities = () => {
  return useQuery({
    queryKey: ["cities-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("is_featured", true)
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
        .eq("is_published", true)
        .order("name");
      if (error) throw error;
      return (data as any[]).map((l) => ({
        ...l,
        city_name: l.cities?.name || "",
      })) as Location[];
    },
  });
};
