# Dropback — Project Doc

## 1. What this is

A lightweight bug-reporting platform for solo devs and small teams. A tester finds a bug, uploads a screenshot (or short video) with a note, and it becomes a shareable **Test Record**. The developer fixes it and flags it for retest. The tester retests the same record and verifies or reopens it. Every round trip is logged, so nobody has to ask "wait, did you fix that thing from last week?"

The product isn't the screenshot. It's the **status loop**: Open → Fixed (pending retest) → Verified/Still Broken → Closed. Most bug tools treat status as a side field; here it's the spine of the product.

## 2. The problem

Solo devs and small teams testing their own products end up doing bug reports over Slack DMs, WhatsApp, or scattered screenshots in a folder. Nothing tracks whether a "fixed" bug was actually retested. Context gets lost between rounds. This app gives that loop a home.

## 3. Primary user (v1)

Solo/small teams — an indie dev and the person(s) testing their product. Two roles only: **tester** and **developer**. A project can have multiple of each.

## 4. Core loop

```
Tester uploads screenshot + note
        ↓
   Status: Open
        ↓
Developer reviews, fixes
        ↓
   Status: Fixed (pending retest)
        ↓
Tester retests
        ↓
   ┌─────────────┐
   Verified   Still Broken → back to In Progress
   ↓
Closed
```

Every status change, comment, and re-upload is stored as an event in an append-only timeline attached to the record — so the record page tells the whole story of that bug from first report to close, not just its current state.

## 5. v1 feature scope

**In scope:**
- Screenshot upload (drag/drop or paste-from-clipboard)
- Optional video upload (not compulsory — screenshot is the primary path, video is an "or attach a video instead" option), capped at **10MB per file**
- Note field describing the bug
- Auto-captured metadata: page URL, timestamp, reporter
- Public, unguessable shareable link per record (read access needs no login)
- Status field + full status history (event log)
- Lightweight comment thread on each record (dev: "can't repro, steps?")
- Email notification on status change
- Realtime in-app updates while both parties are online
- Project grouping, with a project switcher in the dashboard
- Landing page + dashboard (project list)

**Explicitly out of scope for v1:**
- Browser extension / embeddable widget on the site under test
- Video trimming/editing
- Jira/Linear/GitHub Issues integrations
- Granular permissions beyond tester/developer
- Multi-tenant billing

## 6. Access model

- **Read**: public — anyone with a record link can view it. Record IDs are UUIDs, not sequential, so links aren't guessable.
- **Write**: authenticated project members only — commenting, changing status, or adding a retest screenshot requires login.

## 7. Auth: DropAPHI OTP, no passwords

DropAPHI (your own API infra product) handles OTP delivery/verification, doubling as a live proof-of-concept for it.

```
1. User enters email on /login
2. Next.js API route calls DropAPHI's send-otp endpoint
3. User enters the 6-digit code
4. API route verifies it against DropAPHI
5. On success: create/fetch user row, issue session
6. Session cookie (httpOnly) → user lands in dashboard
```

Recommended implementation: **NextAuth (Auth.js) with a Credentials provider**, where the `authorize()` callback calls DropAPHI to verify the OTP, then NextAuth issues the session. This gets you route protection and `useSession()` for free while DropAPHI still does the actual send/verify work. Supabase holds the `users` table; NextAuth just maps a verified email to that row.

## 8. Data model (Supabase)

IDs across the app use **DropID** (DropAPHI's identity/ID service) rather than plain Supabase-generated UUIDs — keeps user and record identity consistent with the rest of your DropAPHI-based stack, and it's another live surface for that product.

```
projects        (id [dropid], name, owner_id, created_at)
members         (project_id, user_id [dropid], role: tester | developer)
test_records    (id [dropid], project_id, reporter_id, url, status, created_at)
record_events   (id [dropid], record_id, actor_id, type, payload, created_at)
```

`type` on `record_events`: `screenshot | video | note | status_change | comment`

Keeping events append-only means the record detail page is just a render of the event stream in order — no separate "history" table to keep in sync.

DropID also keeps the public record links unguessable by default (same property plain UUIDs were giving you, just sourced from DropAPHI instead of Postgres).

## 9. Stack

- **Frontend/backend**: Next.js 14
- **DB + Storage + Realtime**: Supabase
- **Auth**: NextAuth (Credentials provider) + DropAPHI for OTP
- **Notifications**: Resend (or similar) for email; Supabase Realtime for live in-app updates

## 10. Pages

1. **Landing page** — what the product is, the loop, how it works, CTA
2. **Dashboard** — project switcher + list of projects
3. **Project view** — table of test records (thumbnail, note preview, status badge, last updated), filterable by status
4. **New Record form** — screenshot/video upload, URL, note
5. **Record detail page** (the public link) — screenshot/video, note, metadata, full event timeline, status control, comment box
6. **Login** — email + OTP, no password

## 11. Landing page design concept — the animation

Two motifs, both built around the same idea: **a bug that gets resolved is growth, not just a closed ticket.**

**Hero: 3D bug**
A low-poly/wireframe 3D bug rendered in the hero section (three.js or a lightweight WebGL lib). It's not decorative — it changes state on scroll or on a timed loop, mirroring the actual status colors your product uses:
- Red / jittery, slightly erratic movement = `Open`
- Amber / slowing down = `In Progress`
- Green / settles, folds its legs in, goes still = `Fixed → Verified`

This is literally your status loop, dramatized. It's the clearest way to show a first-time visitor what the product *does* without reading copy.

**Secondary: tree animation — reflects real data**
Below the hero or in the "how it works" section — a simple tree (SVG or CSS-animated) that gains a leaf or branch for each bug marked `Verified`, pulled from real per-project counts rather than a decorative loop. On the marketing landing page this can point at an aggregate/demo project; inside the product itself (e.g. on a project's dashboard view), the same tree component can render each project's actual verified-bug count — giving testers/devs a lightweight visual sense of project health, not just a stat.

Implication for the build: the tree component needs a `verifiedCount` prop early on rather than being hardcoded, so the same component serves both the landing page (demo data) and in-app dashboard (live data) without a rewrite.

Keep both animations restrained — one strong 3D moment in the hero, one lighter supporting animation lower on the page. Don't stack multiple heavy WebGL scenes; it'll hurt load time and mobile performance for a landing page that needs to load fast.

**Implementation note**: three.js for the bug (r128-safe primitives — cone/sphere/cylinder geometry for the body/legs works fine, no need for anything exotic), plain SVG + CSS keyframes for the tree — no reason to put that in WebGL too.

## 12. Suggested build order

1. Supabase schema + Storage bucket for screenshots/videos
2. NextAuth + DropAPHI OTP integration, project creation, member invites
3. New Record form → upload → insert record + first event
4. Record detail page rendering the event stream + status control
5. Status change → insert event → Realtime push + email notify
6. Comments (just another event type)
7. Landing page + hero animation last — it's marketing polish, not core loop

## 13. Decisions locked

- **Name**: Dropback
- **IDs**: DropID (DropAPHI) across projects, members, records, and events
- **Tree animation**: reflects real per-project verified-bug counts, not decorative — component takes a `verifiedCount` prop so landing (demo data) and in-app dashboard (live data) share code
- **Video uploads**: capped at 10MB per file

## 14. Still open

- Video retention policy (how long uploads stay in Storage before cleanup)
