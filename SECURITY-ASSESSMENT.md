# Security Assessment — Purple Fireflies Website

## DONE: No Authorization on Admin Server Actions

**RESOLVED.** All admin server actions now call `verifySession()` at the top of their handler, which redirects unauthenticated users to `/login`.

| Action | File | Status |
|---|---|---|
| `createUserAction` / `updateUserAction` / `deleteUserAction` / `resetPasswordAction` | `app/actions/users.ts` | ✅ `verifySession()` + role check |
| `createMealSignupAction` / `updateMealSignupAction` | `app/actions/admin-meal-signup.ts` | ✅ `verifySession()` |
| `createDriverVolunteerAction` / `updateDriverVolunteerAction` | `app/actions/admin-driver-volunteer.ts` | ✅ `verifySession()` |
| `assignDriverAction` | `app/actions/assignments.ts` | ✅ `verifySession()` |
| `sendDriverReminders` | `app/actions/send-reminders.ts` | ✅ `verifySession()` |
| `sendAssignmentEmail` | `app/actions/send-assignment-email.ts` | ✅ `verifySession()` |
| `sendDriverLoadEmail` | `app/actions/send-driver-load-email.ts` | ✅ `verifySession()` |

## DONE: No Role-Based Access Control

**RESOLVED.** User management actions (`createUserAction`, `updateUserAction`, `deleteUserAction`, `resetPasswordAction`) check `session.role !== "admin"` and return an unauthorized error for non-admin users. See `app/actions/users.ts:63-65, 98-100, 146-148, 179-181`.

## MEDIUM: PII Exposed in Reports Client Components

**PARTIALLY RESOLVED.** Hidden form fields in `EmailButton` and `DriverLoadEmailButton` (`app/admin/reports/ReportsTabs.tsx`) now only pass record IDs (`signup_id`, `driver_id`), not PII. The server actions look up the actual data server-side.

Still open: The DataTable columns in the Weekly Assignments, Unassigned, and Driver Load tabs display recipient/driver PII (name, phone, full address) in the browser. Since this is an admin-only page behind authentication, this is a conscious trade-off for usability. Consider using React's `taint` API (`experimental_taintObjectValue`) to prevent accidental PII leakage across the server-client boundary.

## DONE: Error Messages Leak Internal Details

**RESOLVED.** All server actions now return generic error messages to the client (e.g., "Failed to update user.", "Failed to send email. Please try again."). Raw `e.message` is never returned. Internal details are logged server-side via `console.error`.

- `meal-signup.ts`: ✅ Returns generic `getErrorMessage()`
- `driver-volunteer.ts`: ✅ Returns generic `getErrorMessage()`
- `send-reminders.ts`: ✅ Generic message
- `send-assignment-email.ts`: ✅ Generic message
- `send-driver-load-email.ts`: ✅ Generic message

## DONE: No Rate Limiting on Auth/Signup Endpoints

**RESOLVED.** Rate limiting added via the `PURPLE_FIREFLIES_KV` KV namespace:

- `login` action (`app/actions/auth.ts`): 5 attempts per email per 15-minute window blocked with "Too many login attempts."
- `submitMealSignup` (`app/actions/meal-signup.ts`): 5 submissions per 15-minute window
- `submitDriverVolunteer` (`app/actions/driver-volunteer.ts`): 5 submissions per 15-minute window

See `app/lib/rate-limit.ts` for implementation.

## MEDIUM-LOW: `SESSION_SECRET` in Repo Files

**ACKNOWLEDGED.** The JWT signing key is stored in `.env.local` and `.dev.vars` committed to the repo. Recommended action:
- Rotate the secret
- Remove `.env.local` and `.dev.vars` from version control (add to `.gitignore`)
- Set `SESSION_SECRET` as a Cloudflare Workers secret via `wrangler secret put SESSION_SECRET`

## DONE: No CSP Headers

**RESOLVED.** Content Security Policy headers added in `next.config.ts`:

```
default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'
```

Additional security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

## DONE: `sameSite: "lax"` Cookie

**RESOLVED.** Session cookie now uses `sameSite: "strict"` in `app/lib/session.ts:62`.

## DONE: No `server-only` Guard on DB Layer

**RESOLVED.** `app/lib/db.ts` line 1 includes `import "server-only"`, which prevents client-side imports.

## Recommendations

Remaining open items:

1. **Use React `taint` API** — Use `experimental_taintObjectValue()` to prevent PII from crossing the server-client boundary in report data passed as props to `ReportsTabs`.
2. **Rotate `SESSION_SECRET`** — Add only to Cloudflare secrets, remove from repo files.
3. **Restrict email lookup endpoint** — The `getUserByEmail` path (email lookup) in login could theoretically be used for enumeration if the error message differs for existing vs. non-existing users. The current code returns a uniform "Invalid email or password." for both cases, mitigating this.
