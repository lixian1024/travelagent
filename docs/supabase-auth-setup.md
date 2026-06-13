# Supabase Auth Setup

The application supports Google and Meta/Facebook OAuth through Supabase Auth.

## Environment

Copy `.env.example` to `.env.local` and add the project values from Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

Never add a Supabase secret or `service_role` key to a `NEXT_PUBLIC_` variable.

## Supabase URL Configuration

In **Authentication > URL Configuration**:

- Site URL: your production origin
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback`
  - `https://your-production-domain/auth/callback`

## Google

1. Create a Web OAuth client in Google Cloud.
2. Add the Supabase callback URL shown under **Authentication > Providers > Google**
   to Google&apos;s authorized redirect URIs. It has the form:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Add the Google client ID and secret to the Supabase Google provider and enable it.
4. Configure the consent screen, privacy policy, and terms links before production.

## Meta / Facebook

1. Create an app at Meta for Developers and add Facebook Login.
2. Add the Supabase callback URL shown under **Authentication > Providers > Facebook**
   to **Valid OAuth Redirect URIs**.
3. Enable both `public_profile` and `email`. Email permission is required by Supabase.
4. Add the Meta App ID and App Secret to the Supabase Facebook provider and enable it.

## Session Behavior

- OAuth uses PKCE and returns through `/auth/callback`.
- The callback exchanges the authorization code for a Supabase session.
- `src/proxy.ts` refreshes expiring tokens and persists them in secure cookies.
- `/app` redirects unauthenticated users to `/login` after Supabase is configured.
- Without environment variables, the PWA remains available in prototype mode.
