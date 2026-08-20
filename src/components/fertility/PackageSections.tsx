import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, Route, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFertilityIcon } from "@/lib/icons";
import type {
  FaqItem,
  HowItWorksStep,
  IdealForItem,
  InclusionGroup,
} from "@/data/fertilityPackages";

/**
 * Presentational sections shared by the fertility package detail page.
 * All of them are data-driven — none contains package copy of its own.
 */

// ─── Section heading ───────────────────────────────────────────────────────────

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  id,
  align = "left",
}: SectionHeadingProps) => (
  <div className={cn("max-w-2xl mb-8 md:mb-10", align === "center" && "mx-auto text-center")}>
    {eyebrow && (
      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">
        {eyebrow}
      </p>
    )}
    <h2 id={id} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
      {title}
    </h2>
    {description && (
      <p className="text-muted-foreground mt-3 leading-relaxed">{description}</p>
    )}
  </div>
);

// ─── "This package is for you if…" ─────────────────────────────────────────────

export const IsThisForYou = ({ items }: { items: IdealForItem[] }) => {
  if (items.length === 0) return null;
  return (
    <ul className="grid sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const Icon = getFertilityIcon(item.icon);
        return (
          <li
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground leading-snug">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── What's included ───────────────────────────────────────────────────────────

const GROUP_ACCENT: Record<string, string> = {
  her: "border-primary/30 bg-primary/[0.03]",
  him: "border-navy/25 bg-navy/[0.03]",
  together: "border-green-success/30 bg-green-success/[0.04]",
  default: "border-border bg-card",
};

const GROUP_BADGE: Record<string, string> = {
  her: "bg-primary/10 text-primary",
  him: "bg-navy/10 text-navy",
  together: "bg-green-success/10 text-green-success",
  default: "bg-secondary/10 text-foreground/70",
};

export const PackageInclusions = ({ groups }: { groups: InclusionGroup[] }) => {
  if (groups.length === 0) return null;
  const isSplit = groups.some((g) => g.variant === "her" || g.variant === "him");

  return (
    <div className={cn("grid gap-5", isSplit ? "md:grid-cols-2" : "md:grid-cols-2")}>
      {groups.map((group) => {
        const variant = group.variant ?? "default";
        return (
          <section
            key={group.id}
            className={cn(
              "rounded-2xl border p-5 sm:p-6",
              GROUP_ACCENT[variant] ?? GROUP_ACCENT.default,
              // "Together" spans the full width beneath her/him.
              variant === "together" && "md:col-span-2"
            )}
            aria-labelledby={`inclusion-group-${group.id}`}
          >
            <div className="mb-4">
              <span
                className={cn(
                  "inline-block text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2",
                  GROUP_BADGE[variant] ?? GROUP_BADGE.default
                )}
              >
                {group.title}
              </span>
              {group.subtitle && (
                <p
                  id={`inclusion-group-${group.id}`}
                  className="text-sm text-muted-foreground"
                >
                  {group.subtitle}
                </p>
              )}
            </div>

            <ul className="space-y-4">
              {group.items.map((item) => {
                const Icon = getFertilityIcon(item.icon);
                return (
                  <li key={item.id} className="flex items-start gap-3.5">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/70 border border-border text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {item.label}
                        {item.conditional && (
                          <span className="ml-2 align-middle text-[10px] font-medium uppercase tracking-wide text-muted-foreground border border-border rounded-full px-1.5 py-0.5">
                            Where clinically appropriate
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

// ─── What you'll learn ─────────────────────────────────────────────────────────

export const WhatYouLearn = ({ items }: { items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-foreground/85 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
};

// ─── How it works ──────────────────────────────────────────────────────────────

export const HowItWorks = ({ steps }: { steps: HowItWorksStep[] }) => {
  if (steps.length === 0) return null;
  return (
    <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
      {/* Connector: horizontal on desktop, vertical on mobile. */}
      <span
        className="hidden md:block absolute left-0 right-0 top-6 h-px bg-border"
        aria-hidden="true"
      />
      <span
        className="md:hidden absolute left-6 top-3 bottom-3 w-px bg-border"
        aria-hidden="true"
      />
      {steps.map((step) => (
        <li key={step.step} className="relative flex md:block gap-4">
          <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-base font-bold text-primary md:mb-4">
            {step.step}
          </span>
          <div className="min-w-0 pt-2 md:pt-0">
            <h3 className="font-semibold text-foreground leading-snug">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
};

// ─── Results journey ───────────────────────────────────────────────────────────

const JOURNEY = [
  {
    icon: ClipboardCheck,
    title: "Assessment",
    description: "Your consultation and investigations, completed in one visit.",
  },
  {
    icon: FileText,
    title: "Results",
    description: "Your reports collected and prepared for review.",
  },
  {
    icon: Stethoscope,
    title: "Expert review",
    description: "A fertility specialist explains what your results may indicate.",
  },
  {
    icon: Route,
    title: "Personalised plan",
    description: "A clear view of the next steps worth considering.",
  },
];

export const ResultsJourney = () => (
  <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {JOURNEY.map((stage, i) => (
        <li key={stage.title} className="relative flex lg:flex-col items-start gap-4 lg:gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <stage.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{stage.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {stage.description}
            </p>
          </div>
          {i < JOURNEY.length - 1 && (
            <ArrowRight
              className="hidden lg:block absolute -right-2 top-3 h-4 w-4 text-border"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  </div>
);

// ─── FAQs ──────────────────────────────────────────────────────────────────────

export const PackageFaqs = ({ faqs }: { faqs: FaqItem[] }) => {
  if (faqs.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl">
      {faqs.map((faq, i) => (
        <AccordionItem key={faq.question} value={`faq-${i}`} className="border-border">
          <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline hover:text-primary">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
