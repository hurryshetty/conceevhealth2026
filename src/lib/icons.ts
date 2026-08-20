import {
  Baby, HeartPulse, Stethoscope, Scissors, Activity, Pill, Syringe, ShieldCheck, Thermometer,
  Apple, CalendarHeart, ClipboardCheck, Clock, Compass, FileSearch, FlaskConical,
  MessageCircleHeart, Microscope, Receipt, Route, Scan, Snowflake, Sparkles, Sprout,
  TestTube, TrendingUp, Users, Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Baby,
  HeartPulse,
  Stethoscope,
  Scissors,
  Activity,
  Pill,
  Syringe,
  ShieldCheck,
  Thermometer,
};

export const getIconByName = (name: string): LucideIcon => {
  return iconMap[name] || Stethoscope;
};

/**
 * Icons referenced by the fertility package catalogue. Kept as a separate map so
 * the existing surgical-package icon picker (getIconByName) keeps its short,
 * curated option list.
 */
const fertilityIconMap: Record<string, LucideIcon> = {
  ...iconMap,
  Apple,
  CalendarHeart,
  ClipboardCheck,
  Clock,
  Compass,
  FileSearch,
  FlaskConical,
  MessageCircleHeart,
  Microscope,
  Receipt,
  Route,
  Scan,
  Snowflake,
  Sparkles,
  Sprout,
  TestTube,
  TrendingUp,
  Users,
  Waves,
};

export const getFertilityIcon = (name: string | null | undefined): LucideIcon =>
  (name && fertilityIconMap[name]) || Sparkles;
