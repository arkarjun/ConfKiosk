# Setup — Standalone + Registry mode (advanced, many events)

Use this if you (or your org) will run this tool for many events over
time and want **one pair of URLs, forever** - adding a new event becomes
"add a row to the registry," not "deploy a new script." Read
[docs/ARCHITECTURE.md](ARCHITECTURE.md) first if you want to understand
*why* it's structured this way before following the steps.

This assumes you're comfortable with a terminal (for `clasp`) and
creating a Script Property. If that's not you, start with
[SETUP_BOUND.md](SETUP_BOUND.md) instead - you can always migrate later.

## 1. Create the registry hub Sheet

A separate Google Sheet, e.g. "Certificate Generator — Registry". Create
two tabs:

- **Events**: import `templates/starter_registry_events.csv`. Columns:
  `EventId, EventName, SheetId, Active`.
- **Admins**: import `templates/starter_admins.csv`. This is the
  **global** admin list - anyone here can administer *every* registered
  event, so keep it to trusted organizers.

## 2. Create each event's own Sheet

For every event, create a Sheet with just **`Participants`** and
**`Config`** tabs (no `Admins` tab needed here - see step 1). Import
`templates/starter_participants.csv` and `templates/starter_config.csv`
as in the bound guide, fill in participants, and note the Sheet's file ID
from its URL.

Add a row to the registry hub's **Events** tab for it:
`EventId` (short, URL-safe, e.g. `sotm-kerala-2026`), `EventName`,
`SheetId` (the ID you just noted), `Active` = `TRUE`.

## 3. Create the standalone script

```
npm install
npm run build:standalone
cd build/standalone
clasp login                                       # first time only
clasp create --type standalone --title "Certificate Generator (Registry)"
clasp push
```

Unlike the bound version, do **not** pass `--parentId` - a standalone
script isn't attached to any Sheet.

## 4. Point it at your registry, and authorize

Open the project (`clasp open`, or from script.google.com). From the
function dropdown:

1. Select `setupSetRegistrySheetId`, then in the editor's "Run" dialog
   pass your registry hub Sheet's file ID as the argument, and run it.
   (First run will prompt for authorization - Review permissions → your
   account → Advanced → "Go to `<project>` (unsafe)" → Allow.)
2. Select `setupAddMeAsAdmin` and run it. Check the hub's `Admins` tab -
   your email should now be there.

## 5. Deploy #1 — Participant Portal (no sign-in)

**Deploy → New deployment** → Type: **Web app** → Execute as: **Me** →
Who has access: **Anyone** → **Deploy** → copy the URL. This is your
**Participant Portal URL** - the same one for every event, forever.
Participant links now look like:
`<Participant Portal URL>?event=<EventId>&email=...&code=...`

## 6. Deploy #2 — Admin Panel (Google sign-in required)

**Deploy → New deployment** → Type: **Web app** → Execute as: **Me** →
Who has access: **Anyone with a Google account** → **Deploy** → copy the
URL. This is your **Admin Panel URL**. Admin links look like:
`<Admin Panel URL>?event=<EventId>`

## 7. Configure and run each event

Open `<Admin Panel URL>?event=<EventId>` for the event you're working on.
Everything from here is identical to the bound guide's step 7: upload the
design, position fields, set the `ParticipantPortalUrl` in that event's
own Config (it needs the **event-aware** portal URL, i.e. include
`?event=<EventId>` when you paste it in, so emailed links carry the right
event id), generate codes, send emails.

Each event's Config, participants, and certificate design are completely
separate - only the Admins list and the two URLs are shared.

## 8. Adding a new event later

Just repeat step 2 (new Sheet) and add one row to the registry's `Events`
tab. No redeploy, no new URLs.

## Notes & limits

- **Blast radius**: because every event shares one script, a bad edit
  here can affect every event's live links at once. The bound mode's
  per-event copies don't have this risk - factor that into which mode you
  pick for something already live.
- **Email quota**: still tracked at the Google-account level (see the
  bound guide), and now shared across every event you run through this
  one script.
- **Deactivating an event** without deleting it: set `Active` to `FALSE`
  in the registry's `Events` tab.
