import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFertilityIcon } from "@/lib/icons";
import { FERTILITY_INTENTS, type IntentId } from "@/data/fertilityPackages";

/**
 * "What are you looking for?" intent selector.
 *
 * Selecting an intent reorders and highlights packages instantly. It needs no
 * login, stores nothing, and can always be cleared — it is a sorting aid, not a
 * gate in front of the catalogue.
 */

interface IntentSelectorProps {
  value: IntentId | null;
  onChange: (intent: IntentId | null) => void;
  className?: string;
}

const IntentSelector = ({ value, onChange, className }: IntentSelectorProps) => (
  <div className={cn("w-full", className)}>
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
      <h2 id="intent-selector-heading" className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
        I want to&hellip;
      </h2>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear selection
        </button>
      )}
    </div>

    <div
      role="radiogroup"
      aria-labelledby="intent-selector-heading"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {FERTILITY_INTENTS.map((intent) => {
        const Icon = getFertilityIcon(intent.icon);
        const selected = value === intent.id;
        return (
          <button
            key={intent.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? null : intent.id)}
            className={cn(
              "group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary group-hover:bg-primary/15"
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground leading-snug">
                {intent.label}
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                {intent.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default IntentSelector;
