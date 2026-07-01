# Security Assessment — Purple Fireflies Website

## CRITICAL: No Authorization on Admin Server Actions

**Every admin server action is completely unauthenticated.** The middleware only protects page routes (`/admin/*`), but Server Actions are POST endpoints that the middleware matcher doesn't catch. Anyone who discovers the endpoint URLs can call them directly:

| Action | File | What's Exposed |
|---|---|---|
| `createUserAction` / `updateUserAction` / `deleteUserAction` / `resetPasswordAction` | `app/actions/users.ts:56-179` | Create/edit/delete admin users, reset passwords (returns new password in response) |
| `createMealSignupAction` / `updateMealSignupAction` | `app/actions/admin-meal-signup.ts:55-158` | Full PII: name, email, phone, full address, comments |
| `createDriverVolunteerAction` / `updateDriverVolunteerAction` | `app/actions/admin-driver-volunteer.ts:37-120` | Driver name, email, phone |
| `assignDriverAction` | `app/actions/assignments.ts:6-28` | Link recipients to drivers (exposes who gets what) |
| `sendDriverReminders` | `app/actions/send-reminders.ts:18-95` | Reads all recipient PII + sends emails with full addresses |
| `sendAssignmentEmail` | `app/actions/send-assignment-email.ts:10-70` | Sends emails with recipient address to any driver |
| `sendDriverLoadEmail` | `app/actions/send-driver-load-email.ts:11-97` | Reads all PII from DB + sends via email |

None of these call `verifySession()` or any auth check. They use `"use server"` which makes them callable as POST endpoints.

## MEDIUM: No Role-Based Access Control

The `role` field (admin/member) exists in the JWT session payload (`app/lib/definitions.ts:65-69`) but is **never checked anywhere**. Any authenticated user (including a `member`) has full access to all admin functionality, including user management, password resets, and all PII.

## MEDIUM: PII Exposed in Reports Client Components

The reports page (`app/admin/reports/page.tsx` → `ReportsTabs.tsx`) loads **all PII into client components**:
- Weekly assignments tab: recipient name, full address, driver name, phone, email — all rendered in `<form>` hidden fields (lines 50-56, 104-107)
- Unassigned tab: recipient name, phone, full address
- Driver load tab: driver name, phone

The hidden form fields in `EmailButton` (lines 50-56) contain PII in client-side HTML that anyone with a browser's devtools can inspect.

## MEDIUM: Error Messages Leak Internal Details

Several server actions return raw error messages to the client:
- `meal-signup.ts:18`: returns `e.message` for non-D1 errors
- `driver-volunteer.ts:18`: same pattern
- `send-reminders.ts:89-93`: returns `e instanceof Error ? e.message : "unknown error"`
- `send-assignment-email.ts:67-68`: same
- `send-driver-load-email.ts:92-93`: same

## MEDIUM: No Rate Limiting on Auth/Signup Endpoints

No rate limiting exists on:
- `login` action — enables brute-force password attacks (bcrypt cost 12 helps but doesn't prevent unbounded attempts)
- Signup submission — enables form flooding
- Email lookup — enables enumeration

## MEDIUM-LOW: `SESSION_SECRET` in Repo Files

The JWT signing key is stored in `.env.local` and `.dev.vars` committed to the repo. If the repository is compromised, session tokens can be forged.

## MEDIUM-LOW: No CSP Headers

No Content Security Policy is set anywhere. If an XSS vulnerability exists (e.g., in comments displayed in admin DataTable), PII can be exfiltrated.

## LOW: `sameSite: "lax"` Cookie

Session cookie uses `sameSite: "lax"` (`app/lib/session.ts:62`). `"strict"` would prevent the session cookie from being sent on CSRF-initiated navigations.

## LOW: No `server-only` Guard on DB Layer

The DB functions in `app/lib/db.ts` are not wrapped with `import "server-only"`, meaning they could theoretically be imported from client code (though the `getCloudflareContext` call would fail at runtime).

---

## Recommendations

1. **Add auth to all admin server actions** — call `verifySession()` at the top of every action in `app/actions/`.
2. **Check role for sensitive operations** — restrict user management actions to `role === "admin"`.
3. **Add rate limiting** — implement via D1 or KV-based rate limiter.
4. **Strip PII from client component hidden forms** — pass IDs only, look up data server-side.
5. **Sanitize error messages** — never return `e.message` to the client.
6. **Add CSP headers** — configure in `next.config.ts` or Cloudflare.
7. **Set `sameSite: "strict"`** on session cookie.
8. **Consider React `taint` API** — prevent PII from crossing server-client boundary.
9. **Rotate `SESSION_SECRET`** and add only to Cloudflare secrets.
