# QPMS CRM Backend Setup

## Supabase

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Confirm the `site-survey-images` storage bucket exists.

## React Web App

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
VITE_API_URL=http://localhost:4000
```

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

## Flutter

Pass Supabase config at build/run time:

```bash
flutter run --dart-define=SUPABASE_URL=https://your-project.supabase.co --dart-define=SUPABASE_ANON_KEY=your_publishable_anon_key --dart-define=QPMS_API_URL=http://localhost:4000
flutter build apk --release --dart-define=SUPABASE_URL=https://your-project.supabase.co --dart-define=SUPABASE_ANON_KEY=your_publishable_anon_key --dart-define=QPMS_API_URL=https://your-mail-api.example.com
```

Do not commit `.env`, backend app passwords, service role keys, or secret keys.
