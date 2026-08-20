/**
 * Lightweight, dependency-free analytics + marketing attribution.
 *
 * There was no tracking architecture in the project before this module, so it is
 * deliberately small and self-contained:
 *
 *   1. `captureAttribution()` runs once on app boot. It reads UTM parameters,
 *      referrer and device info, stores a *first touch* snapshot permanently and
 *      refreshes the *last touch* snapshot on every new campaign entry.
 *   2. `trackEvent()` fans a named event out to (a) `window.dataLayer` so a GTM /
 *      GA4 container can pick it up without further code changes, and (b) the
 *      `analytics_events` Supabase table for first-party reporting.
 *   3. `getAttributionPayload()` returns the flattened attribution columns to
 *      merge into a `leads` insert, so every lead carries its own source.
 *
 * Every write is fire-and-forget: analytics must never break a page or block a
 * form submission.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Event names ───────────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  PACKAGE_VIEW: "package_view",
  PACKAGE_CTA_CLICK: "package_cta_click",
  PACKAGE_BOOKING_START: "package_booking_start",
  PACKAGE_BOOKING_SUBMIT: "package_booking_submit",
  WHATSAPP_CLICK: "whatsapp_click",
  CONSULTATION_CLICK: "consultation_click",
  COMPARISON_INTERACTION: "comparison_interaction",
  PACKAGE_FILTER: "package_filter",
  PACKAGE_INTENT_SELECTION: "package_intent_selection",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Arbitrary, non-identifying event metadata. Never put patient data in here. */
export type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

// ─── Attribution model ─────────────────────────────────────────────────────────

export interface TouchSnapshot {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  /** Google / Meta click identifiers, when present. */
  click_id: string | null;
  landing_page: string | null;
  referrer: string | null;
  captured_at: string;
}

export interface AttributionPayload extends Omit<TouchSnapshot, "captured_at"> {
  first_touch_source: string | null;
  first_touch_medium: string | null;
  first_touch_campaign: string | null;
  first_touch_landing_page: string | null;
  first_touch_at: string | null;
  last_touch_source: string | null;
  last_touch_medium: string | null;
  last_touch_campaign: string | null;
  last_touch_at: string | null;
  device_type: string;
  browser: string;
  session_id: string;
}

const FIRST_TOUCH_KEY = "ch_attr_first_touch";
const LAST_TOUCH_KEY = "ch_attr_last_touch";
const SESSION_KEY = "ch_session_id";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const CLICK_ID_KEYS = ["gclid", "fbclid", "msclkid", "wbraid", "gbraid"];

// ─── Safe storage helpers ──────────────────────────────────────────────────────
// Private browsing / disabled storage must not throw.

const safeRead = (storage: Storage | undefined, key: string): string | null => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeWrite = (storage: Storage | undefined, key: string, value: string) => {
  try {
    storage?.setItem(key, value);
  } catch {
    /* storage unavailable — attribution degrades to session-only */
  }
};

const parseSnapshot = (raw: string | null): TouchSnapshot | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as TouchSnapshot) : null;
  } catch {
    return null;
  }
};

// ─── Environment detection ─────────────────────────────────────────────────────

const detectDeviceType = (): string => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
    return "tablet";
  }
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
};

const detectBrowser = (): string => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  // Order matters — Edge/Opera/Brave all include "Chrome" in their UA string.
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Other";
};

const newId = (): string => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const getSessionId = (): string => {
  if (typeof window === "undefined") return "ssr";
  const existing = safeRead(window.sessionStorage, SESSION_KEY);
  if (existing) return existing;
  const id = newId();
  safeWrite(window.sessionStorage, SESSION_KEY, id);
  return id;
};

// ─── Capture ───────────────────────────────────────────────────────────────────

const readCurrentTouch = (): TouchSnapshot => {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)?.slice(0, 200) || null])
  ) as Pick<TouchSnapshot, (typeof UTM_KEYS)[number]>;

  const clickIdKey = CLICK_ID_KEYS.find((key) => params.get(key));

  // Same-origin referrers are internal navigation, not an acquisition source.
  let referrer: string | null = null;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) referrer = document.referrer.slice(0, 500);
    }
  } catch {
    referrer = null;
  }

  return {
    ...utm,
    click_id: clickIdKey ? `${clickIdKey}:${params.get(clickIdKey)!.slice(0, 200)}` : null,
    landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer,
    captured_at: new Date().toISOString(),
  };
};

const hasSource = (touch: TouchSnapshot): boolean =>
  Boolean(touch.utm_source || touch.click_id || touch.referrer);

let currentTouch: TouchSnapshot | null = null;

/**
 * Records first- and last-touch attribution. Safe to call more than once; only
 * the first call per page load does work.
 */
export const captureAttribution = (): void => {
  if (typeof window === "undefined" || currentTouch) return;

  currentTouch = readCurrentTouch();

  // First touch is written once and never overwritten.
  if (!safeRead(window.localStorage, FIRST_TOUCH_KEY)) {
    safeWrite(window.localStorage, FIRST_TOUCH_KEY, JSON.stringify(currentTouch));
  }

  // Last touch only advances on a genuinely new acquisition source, so a direct
  // return visit does not wipe the campaign that brought the user in.
  if (hasSource(currentTouch)) {
    safeWrite(window.localStorage, LAST_TOUCH_KEY, JSON.stringify(currentTouch));
  }

  getSessionId();
};

/**
 * Flattened attribution columns, ready to merge into a `leads` insert.
 */
export const getAttributionPayload = (): AttributionPayload => {
  if (typeof window === "undefined") {
    return {
      utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null,
      utm_content: null, click_id: null, landing_page: null, referrer: null,
      first_touch_source: null, first_touch_medium: null, first_touch_campaign: null,
      first_touch_landing_page: null, first_touch_at: null,
      last_touch_source: null, last_touch_medium: null, last_touch_campaign: null,
      last_touch_at: null, device_type: "unknown", browser: "unknown", session_id: "ssr",
    };
  }

  if (!currentTouch) captureAttribution();

  const first = parseSnapshot(safeRead(window.localStorage, FIRST_TOUCH_KEY));
  const last = parseSnapshot(safeRead(window.localStorage, LAST_TOUCH_KEY)) ?? first;
  const now = currentTouch!;

  return {
    // Current visit
    utm_source: now.utm_source ?? last?.utm_source ?? null,
    utm_medium: now.utm_medium ?? last?.utm_medium ?? null,
    utm_campaign: now.utm_campaign ?? last?.utm_campaign ?? null,
    utm_term: now.utm_term ?? last?.utm_term ?? null,
    utm_content: now.utm_content ?? last?.utm_content ?? null,
    click_id: now.click_id ?? last?.click_id ?? null,
    landing_page: now.landing_page,
    referrer: now.referrer ?? last?.referrer ?? null,
    // First touch
    first_touch_source: first?.utm_source ?? first?.referrer ?? null,
    first_touch_medium: first?.utm_medium ?? null,
    first_touch_campaign: first?.utm_campaign ?? null,
    first_touch_landing_page: first?.landing_page ?? null,
    first_touch_at: first?.captured_at ?? null,
    // Last touch
    last_touch_source: last?.utm_source ?? last?.referrer ?? null,
    last_touch_medium: last?.utm_medium ?? null,
    last_touch_campaign: last?.utm_campaign ?? null,
    last_touch_at: last?.captured_at ?? null,
    // Environment
    device_type: detectDeviceType(),
    browser: detectBrowser(),
    session_id: getSessionId(),
  };
};

// ─── Emit ──────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Records a product event.
 *
 * Pushes to `window.dataLayer` (GTM / GA4 ready) and persists to the
 * `analytics_events` table. Both paths are best-effort — failures are swallowed
 * so a blocked tracker or a missing table can never surface to the user.
 */
export const trackEvent = (
  event: AnalyticsEvent,
  properties: EventProperties = {}
): void => {
  if (typeof window === "undefined") return;

  const attribution = getAttributionPayload();

  // 1. Tag-manager layer
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...properties, ...attribution });
  } catch {
    /* ignore */
  }

  // 2. First-party store
  void supabase
    .from("analytics_events")
    .insert({
      event_name: event,
      properties,
      page_path: window.location.pathname,
      session_id: attribution.session_id,
      device_type: attribution.device_type,
      browser: attribution.browser,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_term: attribution.utm_term,
      utm_content: attribution.utm_content,
      landing_page: attribution.landing_page,
      referrer: attribution.referrer,
    })
    .then(
      () => undefined,
      () => undefined
    );
};
