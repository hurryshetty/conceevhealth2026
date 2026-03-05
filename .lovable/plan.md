

## Root Cause Found

The problem is clear: **the imported `supabase` client** (from `@/integrations/supabase/client.ts`) is used for `setSession()`, `signInWithPassword()`, and the admin role check (lines 92, 104, 125). This auto-generated client uses `import.meta.env` variables with **no fallbacks**. If the production build doesn't properly embed these env vars, the client is initialized with `undefined` URL/key, causing every call through it to fail with "Failed to fetch" / "Network error".

Meanwhile, the `loginViaFetch` and `loginViaXHR` functions correctly use hardcoded fallbacks — but even when they succeed and return tokens, the broken `supabase` client fails on `setSession()` (line 92), which throws an error.

### Fix Plan

**1. Simplify `AdminLogin.tsx` — create a local Supabase client with hardcoded fallbacks**

Remove the complex triple-strategy. Instead:
- Create a local `createClient()` instance using the hardcoded Supabase URL and anon key (with env var override if available)
- Use this local client for `signInWithPassword()` directly — no edge function needed
- Use this same local client for the `user_roles` admin check
- After successful login, also set the session on the main `supabase` client so the rest of the app works

This eliminates the dependency on the auto-generated client for the login flow entirely.

**2. Add `manage-users` to `supabase/config.toml`**

The `manage-users` edge function is missing from `config.toml`, meaning it defaults to `verify_jwt = true` (broken with signing-keys). Add it with `verify_jwt = false` so the Users admin page works.

**3. Update `AdminUsers.tsx` — use proper Supabase URL construction**

Currently uses `VITE_SUPABASE_PROJECT_ID` to construct the URL, which may also be missing. Use the same hardcoded fallback pattern.

