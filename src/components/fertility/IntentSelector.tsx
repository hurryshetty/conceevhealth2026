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
      <h2 id="intent-selector-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
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

    {/*
      Mobile gets a single-row scroll rail of compact chips: seven full-size
      cards stacked was roughly two screens of scrolling before a single
      package came into view. From sm up they become the fuller cards.
    */}
    <div
      role="radiogroup"
      aria-labelledby="intent-selector-heading"
      className="-mx-5 flex snap-rail gap-2.5 overflow-x-auto scrollbar-hide px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4"
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
              "group flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-left transition-all duration-200",
              "sm:shrink sm:items-start sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 sm:hover:shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors sm:h-9 sm:w-9 sm:rounded-lg",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary group-hover:bg-primary/15"
              )}
              aria-hidden="true"
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-[13px] font-semibold leading-snug text-foreground sm:whitespace-normal sm:text-sm">
                {intent.label}
              </span>
              {/* Description is noise in a chip; shown from sm up. */}
              <span className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">
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
