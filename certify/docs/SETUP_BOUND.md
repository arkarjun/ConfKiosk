# Setup — Bound mode (default, one event per Sheet)

Use this if you're running one certificate program and want the simplest
possible path. To run another event later, you make a fresh copy of the
Sheet (step 8) - each copy is fully independent.

There are two ways to get the code into Apps Script: with `clasp` (a
terminal, recommended if you're comfortable with one) or fully manually
by copy-pasting into the browser editor. Both end up in the same place.

## 1. Create the Google Sheet

1. Create a new, blank Google Sheet. Name it something like
   `<Event Name> — Certificate Generator`.
2. Create three tabs, named **exactly**: `Participants`, `Config`,
   `Admins` (case-sensitive, no extra spaces).
3. Import the matching starter CSV from `templates/` into each tab
   (File → Import → Upload → select the CSV → Insert location: "Replace
   current sheet" → Import data):
   - `templates/starter_participants.csv` → **Participants**
   - `templates/starter_config.csv` → **Config**
   - `templates/starter_admins.csv` → **Admins** (leave it empty for now
     - step 5 adds you automatically)

The `Participants` starter includes `Designation, Affiliation, EventName,
EventDate, Role` as example columns - **these are just examples**. Add,
remove, or rename columns freely; anything that isn't `Email`, `Code`,
`SendEmail`, `EmailStatus`, `SentDate`, `Downloaded`, or
`FirstDownloadDate` becomes an available field in the Admin panel
automatically. Keep `Name` and `Email` at minimum.

## 2. Add your participants

Fill in one row per person. Leave `Code`, `SendEmail`, `EmailStatus`,
`SentDate`, `Downloaded`, `FirstDownloadDate` blank - the tool fills
these in.

## 3. Get the code into Apps Script

**Option A - with clasp (recommended):**

```
npm install
npm run build:bound
cd build/bound
clasp login                                    # first time only
clasp create --type sheets --title "Certificate Generator" --parentId <YOUR_SHEET_ID>
clasp push
```

The `--parentId` is the long ID in your Sheet's URL
(`docs.google.com/spreadsheets/d/<THIS_PART>/edit`) - passing it attaches
the new script to that Sheet directly, equivalent to opening Extensions →
Apps Script from inside it.

**Option B - fully manual, no terminal:**

From the Sheet: **Extensions → Apps Script**. Delete the placeholder
`Code.gs` content. Then, for every file in `src/core/` and in
`src/bound/`, create a matching **Script** file (same name, without the
`.gs` extension shown in the file picker) and paste its contents in. For
`src/ui/AdminPanel.html` and `src/ui/ParticipantPortal.html`, create
matching **HTML** files the same way. Finally open the project's manifest
(gear icon → "Show appsscript.json manifest file in editor") and replace
its contents with the repo's `appsscript.json`.

Save the project (Ctrl/Cmd+S).

## 4. Authorize the script

Run `setupAddMeAsAdmin` once from the Apps Script editor's function
dropdown, then **Run** (▶). The first time, you'll see an authorization
prompt - Review permissions → your account → Advanced → "Go to
`<project>` (unsafe)" → Allow. (This warning is normal for any
unpublished script, including your own.) Check the `Admins` tab - your
email should now be there.

## 5. Deploy #1 — Participant Portal (no sign-in)

**Deploy → New deployment** → Type: **Web app** → Description:
"Participant Portal" → Execute as: **Me** → Who has access: **Anyone**
→ **Deploy** → copy the Web app URL. This is the **Participant Portal
URL**.

## 6. Deploy #2 — Admin Panel (Google sign-in required)

**Deploy → New deployment** (a second, separate one) → Type: **Web app**
→ Description: "Admin Panel" → Execute as: **Me** → Who has access:
**Anyone with a Google account** → **Deploy** → copy this URL too. This
is the **Admin Panel URL** - keep it private; anyone who opens it and
signs in with a non-admin account just sees the ordinary participant
form, but there's no reason to hand it out.

If you edit the code later, use **Deploy → Manage deployments** → pencil
icon → New version, for *each* of the two deployments (their URLs stay
the same).

## 7. Configure everything from the Admin panel

Open the **Admin Panel URL**, sign in if asked.

1. **Design & positions** - upload your certificate background image
   (PNG/JPG). The field list shown here comes directly from your
   Participants tab's columns. Drag each one into place, adjust font
   size/color/font/alignment, then "Save design & positions".
2. **Email & portal settings** - paste in the **Participant Portal URL**
   from step 5 (required - emailed links need it), and optionally set a
   sender name, reply-to address, default event name, and edit the
   subject/body text.
3. **Participants** - "Refresh from Sheet" to confirm your rows loaded,
   then **Generate codes for all**, uncheck "Send?" for anyone you don't
   want emailed, then **Send emails (checked rows)**. Already-sent rows
   are skipped automatically on re-runs, so it's safe to run again after
   adding new people.

## 8. Reusing this for a new event

Make a full copy of the Sheet (**File → Make a copy**) - this copies its
bound script too. Repeat steps 5-7 for the copy; it gets its own two URLs
and its own participant list, fully independent of this one.

## Notes & limits

- **Email quota**: `MailApp` on a personal Gmail account sends roughly
  100 recipients/day (much higher on Google Workspace). For a large
  event, send in batches across a couple of days, or use a Workspace
  account.
- **Multiple admins**: add more rows to the `Admins` tab (one Google
  account email per row).
- See the main [README](../README.md) for the security model.
