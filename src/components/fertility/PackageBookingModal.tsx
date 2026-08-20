import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { COUNTRY_CODES } from "@/config/site";
import { ANALYTICS_EVENTS, getAttributionPayload, trackEvent } from "@/lib/analytics";
import type { FertilityPackage } from "@/data/fertilityPackages";

/**
 * Package booking flow.
 *
 * Writes into the existing `leads` table rather than introducing a parallel
 * booking store, so every enquiry lands in the same admin/coordinator pipeline
 * that already exists.
 *
 * The richer package + attribution columns were added by
 * supabase/migrations/20260820_fertility_packages.sql and are live. The retry
 * with the base column set is kept as a safety net: if an enriched insert is
 * ever rejected, a real enquiry is still captured rather than lost.
 */

const TIME_SLOTS = [
  { value: "morning", label: "Morning (9am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 4pm)" },
  { value: "evening", label: "Evening (4pm – 7pm)" },
  { value: "flexible", label: "I'm flexible" },
];

const buildSchema = (maxPhoneLen: number, requirePartner: boolean) =>
  z.object({
    name: z.string().trim().min(2, "Please enter your name").max(100),
    countryIdx: z.string(),
    phone: z
      .string()
      .trim()
      .regex(/^\d+$/, "Digits only")
      .min(maxPhoneLen, `Please enter a valid ${maxPhoneLen}-digit number`)
      .max(maxPhoneLen, `Please enter a valid ${maxPhoneLen}-digit number`),
    email: z.string().trim().email("Please enter a valid email address").max(150),
    location: z.string().min(1, "Please choose a location"),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
    consultationPreference: z.string().min(1, "Please choose a preference"),
    variant: z.string().optional(),
    partnerName: requirePartner
      ? z.string().trim().min(2, "Please enter your partner's name").max(100)
      : z.string().trim().max(100).optional(),
    partnerPhone: z
      .string()
      .trim()
      .max(15)
      .optional()
      .refine((v) => !v || /^\d{6,15}$/.test(v), "Please enter a valid number"),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Please accept the terms to continue" }),
    }),
  });

type BookingValues = z.infer<ReturnType<typeof buildSchema>>;

interface PackageBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: FertilityPackage | null;
  /** Where the booking was triggered from, e.g. "listing_card" or "sticky_bar". */
  source?: string;
}

const PackageBookingModal = ({
  open,
  onOpenChange,
  pkg,
  source = "package_page",
}: PackageBookingModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requirePartner = pkg?.audience === "couple";
  const locations = pkg?.locations?.length ? pkg.locations : ["Bangalore", "Hyderabad"];

  const consultationOptions = useMemo(() => {
    if (pkg?.availability_type === "online") return [{ value: "online", label: "Online" }];
    if (pkg?.availability_type === "in_clinic")
      return [{ value: "in_clinic", label: "In-clinic" }];
    return [
      { value: "in_clinic", label: "In-clinic" },
      { value: "online", label: "Online" },
      { value: "no_preference", label: "No preference" },
    ];
  }, [pkg?.availability_type]);

  const [countryIdx, setCountryIdx] = useState("0");
  const maxPhoneLen = COUNTRY_CODES[Number(countryIdx)].maxLen;

  const form = useForm<BookingValues>({
    resolver: zodResolver(buildSchema(maxPhoneLen, requirePartner)),
    mode: "onBlur",
    defaultValues: {
      name: "",
      countryIdx: "0",
      phone: "",
      email: "",
      location: locations[0] ?? "",
      preferredDate: "",
      preferredTime: "",
      consultationPreference: consultationOptions[0]?.value ?? "",
      variant: pkg?.variants?.[0]?.id ?? "",
      partnerName: "",
      partnerPhone: "",
      consent: undefined as unknown as true,
    },
  });

  // Re-seed defaults whenever a different package opens the modal.
  useEffect(() => {
    if (!open || !pkg) return;
    setSubmitted(false);
    form.reset({
      name: "",
      countryIdx: "0",
      phone: "",
      email: "",
      location: pkg.locations[0] ?? "Bangalore",
      preferredDate: "",
      preferredTime: "",
      consultationPreference:
        pkg.availability_type === "online"
          ? "online"
          : pkg.availability_type === "in_clinic"
            ? "in_clinic"
            : "in_clinic",
      variant: pkg.variants?.[0]?.id ?? "",
      partnerName: "",
      partnerPhone: "",
      consent: undefined as unknown as true,
    });
    setCountryIdx("0");
    trackEvent(ANALYTICS_EVENTS.PACKAGE_BOOKING_START, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      source,
    });
    // form is a stable RHF instance; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pkg?.slug]);

  if (!pkg) return null;

  const today = new Date().toISOString().split("T")[0];

  const onSubmit = async (values: BookingValues) => {
    setSubmitting(true);
    const country = COUNTRY_CODES[Number(values.countryIdx)];
    const attribution = getAttributionPayload();
    const selectedVariant = pkg.variants.find((v) => v.id === values.variant);

    // Columns that exist on `leads` today.
    const baseLead = {
      name: values.name.slice(0, 100),
      phone: `${country.code}${values.phone}`.slice(0, 15),
      email: values.email.slice(0, 150),
      procedure_interest: pkg.name.slice(0, 100),
      city: values.location,
      preferred_city: values.location,
      source_page: `fertility-package-${pkg.slug}`,
      lead_type: "fertility_package",
    };

    // Columns added by the fertility packages migration.
    const enrichedLead = {
      ...baseLead,
      package_slug: pkg.slug,
      package_name: pkg.name,
      package_variant: selectedVariant?.label ?? null,
      preferred_date: values.preferredDate || null,
      preferred_time: values.preferredTime || null,
      consultation_preference: values.consultationPreference,
      partner_name: values.partnerName?.trim() || null,
      partner_phone: values.partnerPhone?.trim()
        ? `${country.code}${values.partnerPhone.trim()}`.slice(0, 15)
        : null,
      consent_given: true,
      consent_given_at: new Date().toISOString(),
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_term: attribution.utm_term,
      utm_content: attribution.utm_content,
      landing_page: attribution.landing_page,
      referrer: attribution.referrer,
      device_type: attribution.device_type,
      browser: attribution.browser,
      first_touch_source: attribution.first_touch_source,
      first_touch_medium: attribution.first_touch_medium,
      first_touch_campaign: attribution.first_touch_campaign,
      last_touch_source: attribution.last_touch_source,
      last_touch_medium: attribution.last_touch_medium,
      last_touch_campaign: attribution.last_touch_campaign,
    };

    let { error } = await supabase.from("leads").insert(enrichedLead);

    if (error) {
      // Safety net: retry with only the columns that predate this module, so a
      // real enquiry is never dropped on the floor.
      ({ error } = await supabase.from("leads").insert(baseLead));
    }

    setSubmitting(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again, or reach us on WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    trackEvent(ANALYTICS_EVENTS.PACKAGE_BOOKING_SUBMIT, {
      package_slug: pkg.slug,
      package_name: pkg.name,
      location: values.location,
      consultation_preference: values.consultationPreference,
      variant: selectedVariant?.id ?? null,
      source,
    });

    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[92vh] overflow-y-auto">
        {submitted ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-success/10">
              <CheckCircle2 className="h-7 w-7 text-green-success" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl font-bold text-foreground mb-2">
              Request received
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Thank you. A Conceev care coordinator will contact you to confirm your{" "}
              <span className="font-medium text-foreground">{pkg.name}</span> appointment,
              your location and anything you need to prepare.
            </p>
            <Button className="rounded-full mt-6" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="font-serif text-xl">Book {pkg.name}</DialogTitle>
              <DialogDescription>
                Share your details and a care coordinator will confirm your appointment and
                full pricing before anything is booked.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name *</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="name" maxLength={100} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="booking-phone">Mobile number *</FormLabel>
                      <div className="flex gap-1.5">
                        <Select
                          value={countryIdx}
                          onValueChange={(v) => {
                            setCountryIdx(v);
                            form.setValue("countryIdx", v);
                            form.setValue("phone", "");
                          }}
                        >
                          <SelectTrigger className="w-[92px] px-2" aria-label="Country code">
                            <SelectValue>
                              {COUNTRY_CODES[Number(countryIdx)].flag}{" "}
                              {COUNTRY_CODES[Number(countryIdx)].code}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_CODES.map((c, i) => (
                              <SelectItem key={c.code} value={String(i)}>
                                {c.flag} {c.code} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input
                            id="booking-phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            className="flex-1"
                            maxLength={maxPhoneLen}
                            value={field.value}
                            onBlur={field.onBlur}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.replace(/\D/g, "").slice(0, maxPhoneLen)
                              )
                            }
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" autoComplete="email" maxLength={150} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Used to share your appointment details and results securely.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {pkg.variants.length > 0 && (
                  <FormField
                    control={form.control}
                    name="variant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which would you like?</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pkg.variants.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id}>
                                {variant.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred location *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultationPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation preference *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {consultationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" min={today} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred time</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Any time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {requirePartner && (
                  <fieldset className="rounded-xl border border-border bg-secondary/[0.04] p-4 space-y-4">
                    <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Partner details
                    </legend>
                    <FormField
                      control={form.control}
                      name="partnerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner's name *</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={100} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="partnerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner's mobile number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              inputMode="numeric"
                              maxLength={maxPhoneLen}
                              value={field.value ?? ""}
                              onBlur={field.onBlur}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.replace(/\D/g, "").slice(0, maxPhoneLen)
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Optional — helps us coordinate both appointments.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </fieldset>
                )}

                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-2.5">
                        <FormControl>
                          <Checkbox
                            checked={field.value === true}
                            onCheckedChange={(v) => field.onChange(v === true ? true : undefined)}
                            className="mt-0.5"
                            aria-describedby="consent-text"
                          />
                        </FormControl>
                        <FormLabel
                          id="consent-text"
                          className="text-xs font-normal leading-snug text-muted-foreground cursor-pointer"
                        >
                          I agree to be contacted by Conceev Health about this enquiry, and
                          accept the Terms &amp; Conditions and Privacy Policy.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full rounded-full gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Submitting&hellip;
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                      Request appointment
                    </>
                  )}
                </Button>

                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden="true" />
                  Your details are used only to coordinate your care. Nothing is booked or
                  charged until you confirm with our care team.
                </p>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackageBookingModal;
