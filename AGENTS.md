# Genesis · Landlord (Figma Make)

Clickable prototype of the **Landlord** portal (signed in as the landlord Margaret Okafor). It uses the same design system as the Supervisor (`sadaqat786921/genesis-supervisor-platform`) and Office Admin (`sadaqat786921/genesis-officeadmin-platform`) portals for Landlord Service Plans (LSP): the client-approved design **"Dashboard Variation 04"** (Figma: Genesis page, node 342:2369, and the "Genesis · Design System" section). React 19 + Vite + TypeScript, running inside Figma Make.

## Do not redesign
The client has approved this design. When editing:
- Keep the layout: a 264px white sidebar card on the left (logo, 5 menu groups, live counts, the user at the bottom), with content on the right inside 24px page padding and 20px gaps between blocks.
- Keep the colours, font, radii and shadows listed below. Use the CSS variables in `src/styles/app.css` and never hard-code new colours.
- Keep the existing classes and components (`.card`, `.kpi`, `.chip`, `.btn`, `Drawer`, `Modal`, `Tabs` and so on). Add new screens by reusing them.
- Do not add Tailwind's base reset (preflight). `src/index.css` loads only Tailwind's theme and utilities, on purpose.
- Tailwind utilities are switched on, so never name a custom class after a Tailwind utility (`outline`, `ring`, `shadow`, `border`, `hidden`…). That is why the outline button uses the class `.btn.line` and the dashboard ring uses `.gring`.
- Do not swap the icon set (lucide-react, stroke width 1.8) or the font (Montserrat).
- Images are relative paths under `public/images/` (`images/home1.jpg`). Keep them as normal git files, not LFS.
- Besides React, only two packages are needed: `react-router-dom` and `lucide-react`. If an import fails, add the missing package to package.json — never delete screens or swap libraries.
- Routing uses `HashRouter`. Paths look like `#/landlords/L1`.

## Design tokens (`src/styles/app.css`)
| Token | Value |
|---|---|
| Font | Montserrat 400/500/600/700/800 (self-hosted in `src/fonts`, loaded by `src/styles/fonts.css` — no font package needed) |
| Page background | `#F3F5F9` |
| Surface (cards) | `#FFFFFF`, border `#E9EDF3`, radius 22, padding 20, shadow `0 8px 24px rgba(15,24,40,.04)` |
| Brand navy | `#153D91` (hover `#0F3279`, subtle `#EEF3FC`) |
| Deep navy (hero / inverse) | `#001649` |
| Accent green | `#5BAF00` |
| Text | primary `#0F1828`, secondary `#475467`, tertiary `#667085`, placeholder `#98A2B3` |
| Status | ok `#3C7300` / `#E8F4DB` · warning `#B54708` / `#FEF0C7` · error `#C8102E` / `#FDE8EB` · info `#0B6FB8` / `#E0F2FE` |
| Radius | 6, 8, 10, 12 (buttons and inputs), 14, 20 (sidebar), 22 (cards), 24 (hero), 999 (chips) |
| Type | H1 24/800 · H2 15/700 · metric 26/800 · body 13/500 · small 12.5/500 · caption 11/500 · hero number 56/800 |

## Landlord rules (this portal)
- Signed in as `ME` = `L1`, Margaret Okafor (`src/data.ts`). Demo login: any email/password, code `123456`. "First time? Set your password" shows the welcome-email password setup; "Forgot password?" sends a reset link. 5 wrong codes lock the account.
- The store (`src/store.tsx`, `SCOPE`) loads only her records: her homes, their tenants, rent, repairs, certificates, inspections, her invoices and lease payments. Occupiers of a home leased to LSP are LSP's tenants, so they are not shown. On a leased home she only sees owner repairs (roof and structure).
- Her homes: 12 Oak Street and Flat 4, 19 Highgate Hill are managed on the 16% plan (job limit £200, allowance £600 a year); 6 Rosebery Gardens is leased to LSP (lease rent £1,200 a month, no fee). Data for P16, T14, J15–J18, INV-1039/1041/1047/1048 and her messages is at the end of `data.ts`.
- Web only, desktop first (same layout as the staff portals). No native app.

## Screens (`src/pages/`)
- `Home.tsx`: payout hero (this month's payout, allowance ring), Needs your decision, rent/arrears/safety/allowance KPIs, your homes, coming up, repairs under way, your Office Admin.
- `Approvals.tsx` (**Needs my approval**): repairs over the job limit, and owner repairs on leased homes. Detail shows the invoice on LSP paper (FOR APPROVAL), photos, how you pay, allowance. Approve (tick to confirm, optional note) → job `Assigned`; Decline (reason) → `Declined`, nothing charged; Ask a question → message. "No reply is not a yes". Decided tab keeps every decision with date and time.
- `Repairs.tsx`: list with search, type and year filter; **Report a repair** form (home, room, type, urgency, access, phone, photos); repair page with landlord steps (Reported → Priced → Approved by LSP → [Your approval] → Work in progress → Checked by LSP → Done), what happens next, cost and who pays, photo proof, repair report PDF. Internal costs, hours and margins are never shown.
- `Properties.tsx`: cards (Managed / Leased to LSP); managed home tabs: Overview (fee and maintenance), Tenancy, Repairs, Safety checks, Inspections (locked reports), Rent, Documents, History; leased home tabs: Overview, Lease, Lease payments, Owner repairs, Safety checks, Documents, History. Property Management Plan view and PDF.
- `Tenants.tsx`: tenancy, rent, deposit, repairs reported, documents. KYC files and contact stay with LSP.
- `Safety.tsx`: certificates (search, type, year), renewal booked, earlier versions, inspections and safety visits.
- `Rent.tsx`: monthly statements (rent received − fee − VAT − repairs she pays = paid to her on the 20th), statement drawer and PDF, rent this month (part payments, reminders), lease payments from LSP.
- `Invoices.tsx`: covered by plan (£0 to pay), needs approval, approved (charged when done), to pay; "I've paid by bank transfer".
- `Plan.tsx` (**My Plan & Allowance**): plan, job limit, renewal, allowance (used, approved in progress, left, 70/90/100% alerts), where it went, fee per home, all plans, ask to change plan.
- `Documents.tsx`: every document (certificates and earlier versions, tenancy agreements, deposit certificates, inspection and repair reports, invoices, statements, plans, lease, agreement) with search, type and year.
- `Messages.tsx`: conversation with LSP and **My requests** (plan change, bank details, email change, end the agreement) with LSP's answers.
- `Activity.tsx`, `Account.tsx` (details, bank change request with phone check, notifications, password and security, agreement, data copy).
- `lib.tsx`: landlord status wording (`jobView`, `needsMe`, `yourStep`), allowance (`allowanceOf`), statements, invoice status, the LSP paper template (`DocSheet`) and the invoice, repair report, inspection and plan pop-ups.

## Money rules
- Repairs under the job limit are covered by the plan: the invoice shows £0 to pay and the amount is taken off the allowance once, when the work is done.
- Over the job limit (and owner repairs on leased homes) the landlord approves an invoice before work starts and pays for it after the work is done and checked (taken from the next payout or paid by transfer).
- VAT (company setting, default Off) is added to LSP's fee only. Leased homes have no fee; LSP pays the lease rent on its own schedule.
