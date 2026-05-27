# Budget Buckets — Decision Log

A record of significant architectural and product decisions, including the reasoning behind each.

---

## 2026-05-26 — Initial Scoping Session

### Hosting: Netlify
**Decision:** Host on Netlify free tier.
**Reason:** Free for personal/hobby projects, no credit card required, auto-deploys from code pushes, easy to set up. Sufficient for a private family app with no scaling concerns.

### Database & Auth: Firebase
**Decision:** Use Firebase Firestore (database) and Firebase Authentication (user accounts).
**Reason:** Free at family-app scale (far below daily read/write limits), real-time sync across devices with no server to maintain, handles auth and database in one platform. Netlify serves the app files; Firebase holds the data.

### Frontend: React + Vite + Tailwind CSS
**Decision:** React for the UI framework, Vite for the build tool, Tailwind CSS for styling.
**Reason:** Industry-standard stack, large community, excellent mobile-first support with Tailwind, good component ecosystem for charts (donut charts, progress bars).

### Mobile Strategy: PWA
**Decision:** Build as a Progressive Web App rather than a native iOS app.
**Reason:** User does not have an Apple Developer license ($99/year) and the app is private/family use. PWA installed via Safari "Add to Home Screen" gives a native-like experience (full screen, home screen icon) at no cost.

### Authentication Model: Individual accounts, shared budget
**Decision:** Each family member gets their own Firebase Auth account (email + password). All accounts share one household budget dataset in Firestore.
**Reason:** Allows per-user transaction tracking to be added later without reworking the auth model. Admin (Luke) creates accounts — no open registration.

### Google Sheets Integration: CSV Import
**Decision:** Monthly budget setup via CSV file exported from Google Sheets, not a live API connection.
**Reason:** Live Google Sheets API requires OAuth setup, Google Cloud project, and API credentials — significant complexity for a step that happens once a month. CSV export is two clicks in Sheets; the app parses the file on upload. Can be upgraded to live API in a future phase if desired.

### Transaction Fields at Launch: Amount + Category only
**Decision:** Transactions capture amount and category only. Date and user fields deferred.
**Reason:** Keeping entry as frictionless as possible at launch. Date and user attribution planned for a future phase once the core app is stable.

### History: Current month only at launch
**Decision:** App shows only the current month's budget and transactions at launch.
**Reason:** Simplifies the data model and UI significantly. Historical months are a natural next feature after the core experience is solid.

### App Name: Budget Buckets
**Decision:** App named "Budget Buckets."
**Reason:** Connects to the "bucket budgeting" mental model (money divided into named buckets), matches the language the household already uses ("budget"), and is descriptive and memorable.
