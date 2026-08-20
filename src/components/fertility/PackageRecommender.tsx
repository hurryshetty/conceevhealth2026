import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFertilityIcon } from "@/lib/icons";
import type { FertilityPackage } from "@/data/fertilityPackages";
import PriceBlock from "@/components/fertility/PriceBlock";

/**
 * "Which package is right for me?" — a four-question suggestion flow.
 *
 * Deliberately *not* a clinical triage tool. It applies transparent, additive
 * weights to package slugs and surfaces a starting point plus one alternative,
 * with an explicit note that it is not medical advice. Nothing is stored and no
 * login is required.
 */

interface RecommenderQuestion {
  id: string;
  question: string;
  helper?: string;
  options: {
    id: string;
    label: string;
    /** Package slug → weight. */
    scores: Record<string, number>;
  }[];
}

const QUESTIONS: RecommenderQuestion[] = [
  {
    id: "who",
    question: "Who is this assessment for?",
    options: [
      { id: "me", label: "Just me", scores: {} },
      {
        id: "couple",
        label: "Me and my partner, together",
        scores: { "couples-fertility-assessment": 5 },
      },
    ],
  },
  {
    id: "stage",
    question: "Where are you right now?",
    helper: "Choose whichever is closest — nothing here is binding.",
    options: [
      {
        id: "planning",
        label: "Planning pregnancy, but not trying yet",
        scores: {
          "preconception-fertility-wellness": 4,
          "fertility-health-check": 3,
        },
      },
      {
        id: "trying",
        label: "Actively trying to conceive",
        scores: {
          "complete-fertility-assessment": 4,
          "couples-fertility-assessment": 3,
        },
      },
      {
        id: "trying-long",
        label: "Trying for a while without success",
        scores: {
          "couples-fertility-assessment": 5,
          "complete-fertility-assessment": 4,
        },
      },
      {
        id: "freezing",
        label: "Thinking about freezing my eggs",
        scores: { "egg-freezing-readiness-check": 6 },
      },
      {
        id: "curious",
        label: "Just want to understand my fertility",
        scores: {
          "fertility-health-check": 4,
          "complete-fertility-assessment": 2,
        },
      },
    ],
  },
  {
    id: "prior",
    question: "Have you had a fertility assessment before?",
    options: [
      { id: "none", label: "No, never", scores: { "fertility-health-check": 3 } },
      {
        id: "some",
        label: "Some tests, a while ago",
        scores: { "complete-fertility-assessment": 3 },
      },
      {
        id: "full",
        label: "Yes, and I have reports or a proposed plan",
        scores: { "fertility-expert-consultation": 4 },
      },
    ],
  },
  {
    id: "need",
    question: "What would help most right now?",
    options: [
      {
        id: "answers",
        label: "Test results and clear numbers",
        scores: {
          "complete-fertility-assessment": 3,
          "fertility-health-check": 2,
        },
      },
      {
        id: "talk",
        label: "A conversation with an expert first",
        scores: { "fertility-expert-consultation": 5 },
      },
      {
        id: "both",
        label: "Both — tests and a conversation",
        scores: {
          "complete-fertility-assessment": 3,
          "couples-fertility-assessment": 2,
        },
      },
    ],
  },
];

interface PackageRecommenderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: FertilityPackage[];
  onBook: (pkg: FertilityPackage) => void;
  onComplete?: (slug: string, answers: Record<string, string>) => void;
}

const PackageRecommender = ({
  open,
  onOpenChange,
  packages,
  onBook,
  onComplete,
}: PackageRecommenderProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const finished = step >= QUESTIONS.length;

  const ranked = useMemo(() => {
    if (!finished) return [];
    const scores = new Map<string, number>();
    QUESTIONS.forEach((question) => {
      const chosen = question.options.find((opt) => opt.id === answers[question.id]);
      if (!chosen) return;
      Object.entries(chosen.scores).forEach(([slug, weight]) => {
        scores.set(slug, (scores.get(slug) ?? 0) + weight);
      });
    });

    return packages
      .map((pkg) => ({ pkg, score: scores.get(pkg.slug) ?? 0 }))
      .sort((a, b) => b.score - a.score || a.pkg.display_order - b.pkg.display_order)
      .filter((entry) => entry.score > 0);
  }, [finished, answers, packages]);

  const primary = ranked[0]?.pkg;
  const alternative = ranked[1]?.pkg;

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      // Give the close animation time to finish before wiping the content.
      setTimeout(reset, 200);
    }
  };

  const choose = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep >= QUESTIONS.length) {
      // Recompute here so the completion event carries the final slug.
      const scores = new Map<string, number>();
      QUESTIONS.forEach((question) => {
        const chosen = question.options.find((opt) => opt.id === next[question.id]);
        if (!chosen) return;
        Object.entries(chosen.scores).forEach(([slug, weight]) => {
          scores.set(slug, (scores.get(slug) ?? 0) + weight);
        });
      });
      const top = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) onComplete?.(top[0], next);
    }
  };

  const current = QUESTIONS[step];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-xl">
            {finished ? "Here's a good place to start" : "Find your starting point"}
          </DialogTitle>
          <DialogDescription>
            {finished
              ? "A suggestion based on your answers. You can explore any package — this is a starting point, not medical advice."
              : "Four quick questions. No login, nothing saved."}
          </DialogDescription>
        </DialogHeader>

        {!finished && current && (
          <div className="mt-2">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className="h-1 flex-1 rounded-full bg-border overflow-hidden"
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={QUESTIONS.length}
                aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}
              >
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {step + 1} / {QUESTIONS.length}
              </span>
            </div>

            <fieldset>
              <legend className="text-base font-semibold text-foreground mb-1">
                {current.question}
              </legend>
              {current.helper && (
                <p className="text-xs text-muted-foreground mb-3">{current.helper}</p>
              )}
              <div className="space-y-2 mt-3">
                {current.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(current.id, option.id)}
                    className={cn(
                      "w-full text-left rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all",
                      "hover:border-primary/50 hover:bg-primary/[0.03]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {step > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 gap-1.5 text-muted-foreground"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back
              </Button>
            )}
          </div>
        )}

        {finished && (
          <div className="mt-2 space-y-4">
            {primary ? (
              <>
                <div className="rounded-2xl border border-primary/40 bg-primary/[0.04] p-5">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary mb-2">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Suggested for you
                  </p>
                  <div className="flex items-start gap-3">
                    {(() => {
                      const Icon = getFertilityIcon(primary.icon);
                      return (
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      );
                    })()}
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {primary.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {primary.short_description}
                      </p>
                      <PriceBlock pkg={primary} compact className="mt-3" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 mt-4">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => {
                        onBook(primary);
                        handleClose(false);
                      }}
                    >
                      Book this package
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-full gap-1.5" asChild>
                      <Link
                        to={`/fertility-packages/${primary.slug}`}
                        onClick={() => handleClose(false)}
                      >
                        View details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {alternative && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Also worth considering
                    </p>
                    <Link
                      to={`/fertility-packages/${alternative.slug}`}
                      onClick={() => handleClose(false)}
                      className="font-serif font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {alternative.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alternative.short_description}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                We couldn't narrow it down from your answers. Browsing the full range, or
                speaking to a fertility expert, is the best next step.
              </p>
            )}

            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              This suggestion is a starting point based on your answers. It is not a
              diagnosis or medical advice — your fertility specialist confirms what is
              right for you.
            </p>

            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Start over
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackageRecommender;
