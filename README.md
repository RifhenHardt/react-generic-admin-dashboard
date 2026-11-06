# Campus Market Admin

A responsive admin dashboard prototype for a campus event marketplace. Student organizations and project teams can list food, clothing, wearable accessories, souvenirs, arts and crafts, and project products for campus events.

## Account system

Accounts are stored in Cloudflare D1. Passwords are PBKDF2 hashed; browser sessions use expiring HttpOnly cookies. Students can register directly. Seller accounts begin pending verification; an admin can approve or suspend accounts. Admin registration requires the private `STAFF_INVITE_CODE` secret.

To optionally restrict registrations to school domains, set `CAMPUS_EMAIL_DOMAINS` in the Cloudflare Pages environment, for example `campus.edu,students.campus.edu`.

## Run locally

```powershell
npm.cmd install
npx.cmd wrangler pages dev build
```

For local account API access, apply the D1 migration locally first with `npx.cmd wrangler d1 migrations apply campus-market-auth --local`. Create a `.dev.vars` file containing `STAFF_INVITE_CODE="your-local-invite-code"` before starting Pages Dev. The React development server (`npm.cmd start`) serves the UI but does not run Pages Functions.

Open the local URL printed by Wrangler.

## Dashboard areas

- **Overview:** product review counts, campus vendors, reports, and the next event.
- **Campus Events:** create events and set dates, locations, and vendor status.
- **Product Listings:** manage seller teams, event booths, prices, stock, product details, and review status.
- **Orders & Reservations:** track buyer reservations and pickup progress at campus events.
- **Student & Seller Accounts:** review registrations, approve seller accounts, or suspend accounts.
- **Product Categories:** manage food and drinks, clothing, wearable accessories, souvenirs, arts and crafts, and project products.
- **Product Reports:** review food safety, misleading listing, prohibited item, and seller conduct reports.

## Cloudflare setup

The Pages project uses the `DB` binding from `wrangler.toml`. Apply schema changes with `npx.cmd wrangler d1 migrations apply campus-market-auth --remote`. The production admin invite is stored as the Pages secret `STAFF_INVITE_CODE`; do not put its value in source control. To configure an allowed school email domain, set the Pages variable `CAMPUS_EMAIL_DOMAINS`.

To publish a new build, run `npm.cmd run build`, then `npx.cmd wrangler pages deploy build --project-name electrolink-admin --branch main`.

## Current prototype limits

Account registration, login, sessions, account status, and admin account review use the shared D1 database. Product, order, event, and category records are still demo data stored in the current browser's local storage; those marketplace changes are not shared between users or devices. School email ownership is not verified by email, and payment processing is not connected.
