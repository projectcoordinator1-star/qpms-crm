# QPMS CRM Backend Setup

## Supabase

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Confirm the `site-survey-images` storage bucket exists.

Expected tables:

- `profiles`
- `leads`
- `lead_contacts`
- `lead_mom`
- `site_visits`
- `site_assessments`
- `site_images`
- `site_mom`
- `approval_requests`
- `activity_logs`

During development, the SQL file creates permissive anon RLS policies. If lead inserts fail, check the browser console for `[QPMS Supabase] Lead insert failed`; common causes are missing tables, missing RLS policy, or using the `/rest/v1/` URL instead of the project base URL.

## React Web App

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
VITE_API_URL=http://localhost:4000
```

When the frontend starts, the browser console should show:

```text
[QPMS Supabase] Config check
[QPMS Workflow] Supabase env detected; loading remote workflow data
[QPMS Supabase] Workflow fetch success
```

When a lead is created, the browser console should show:

```text
[QPMS Workflow] Add lead invoked
[QPMS Supabase] Creating lead payload
[QPMS Supabase] Lead insert success
[QPMS Supabase] Lead contacts insert success
```

If you see `mode: local` or `Supabase env missing`, the app is not using Supabase for inserts.

## Mail API

Create `backend/.env` from `backend/.env.example`:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
EMAIL_USER=office_mail@qpms.co.in
EMAIL_PASS=your_google_workspace_app_password
```

Run:

```bash
npm run server
```

Expected backend startup log:

```text
[QPMS Mail API] Startup complete
```

Health check:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"ok":true,"service":"qpms-mail-api"}
```

## Flutter

Pass Supabase config at build/run time:

```bash
flutter run --dart-define=SUPABASE_URL=https://your-project.supabase.co --dart-define=SUPABASE_ANON_KEY=your_publishable_anon_key --dart-define=QPMS_API_URL=http://localhost:4000
flutter build apk --release --dart-define=SUPABASE_URL=https://your-project.supabase.co --dart-define=SUPABASE_ANON_KEY=your_publishable_anon_key --dart-define=QPMS_API_URL=https://your-mail-api.example.com
```

Do not commit `.env`, backend app passwords, service role keys, or secret keys.
