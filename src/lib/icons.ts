import { Baby, HeartPulse, Stethoscope, Scissors, Activity, Pill, Syringe, ShieldCheck, Thermometer } from "lucide-react";
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
