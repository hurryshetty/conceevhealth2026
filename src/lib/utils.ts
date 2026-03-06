import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price string for display in INR.
 * - "10000"      → "₹10,000"
 * - "120000"     → "₹1,20,000"
 * - "1,20,000"   → "₹1,20,000"
 * - "₹1,20,000"  → "₹1,20,000"  (no-op)
 * - "Contact for Pricing" → "Contact for Pricing" (non-numeric, no-op)
 */
export function formatPrice(price: string | null | undefined): string {
  if (!price) return "";
  const trimmed = price.trim();
  if (trimmed.startsWith("₹")) return trimmed;
  // Strip existing commas/spaces to get raw number
  const digits = trimmed.replace(/[,\s]/g, "");
  const num = Number(digits);
  if (!isNaN(num) && digits !== "") {
    // Indian numbering: last 3 digits, then groups of 2
    return "₹" + num.toLocaleString("en-IN");
  }
  return trimmed;
}
