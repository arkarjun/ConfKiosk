# Architecture

## The core idea: one seam

Every module in `src/core/` operates on an **EventContext**:

```js
{ ss: Spreadsheet, adminsSs: Spreadsheet, eventId: string|null }
```

- `ss` — the Spreadsheet holding that event's `Participants` and `Config`
  tabs.
- `adminsSs` — the Spreadsheet holding the `Admins` tab that decides who
  gets admin access. In bound mode this is the same object as `ss`; in
  standalone mode it's the shared registry hub.
- `eventId` — `null` in bound mode; the event's id (from the `?event=`
  URL parameter) in standalone mode.

Nothing in `src/core/` ever calls `SpreadsheetApp.getActiveSpreadsheet()`
or otherwise assumes which Spreadsheet it's talking to. The **only**
function that decides that is `resolveEventContext_(eventId)`, and each
shell defines its own:

- `src/bound/Bound.gs` → always returns the Spreadsheet this script is
  bound to, for both `ss` and `adminsSs`. `eventId` is ignored entirely.
- `src/standalone/Standalone.gs` → looks `eventId` up in a registry
  Sheet (`Events` tab: EventId → SheetId) to find `ss`, and always
  returns the registry hub itself as `adminsSs`.

Everything else - `Web.gs`'s `doGet` dispatcher, every `admin*`/
`participant*` function, `AdminPanel.html`, `ParticipantPortal.html` - is
completely unaware of which shell is active. That's what "shared core"
means here: swap `resolveEventContext_` and the rest of the app just
works, unchanged.

## Why a build step, if it's "just" file copying

Apps Script has two fundamentally different project types:

- A **container-bound** script lives inside one specific Sheet's Drive
  item. `SpreadsheetApp.getActiveSpreadsheet()` resolves to that Sheet
  automatically - which is exactly what the bound shell wants.
- A **standalone** script is its own Drive item, unattached to anything.

These are two different Apps Script **projects** with two different
script IDs - you cannot push "half" of a project's files to one and the
rest to another, and `clasp push` pushes everything under one `rootDir`
to one project. So the two shells can't literally share one deployment;
what they share is the *source* in `src/core/` and `src/ui/`.

`scripts/build.js` resolves this by copying `src/core/*.gs` +
`src/ui/*.html` + the *chosen* shell's `.gs` file(s) into
`build/<target>/`, which is what you actually run `clasp push` from (via
`npm run push:bound` / `push:standalone`). Edit `src/core/`, rebuild
both, and both projects pick up the fix - there's exactly one copy of
the logic to maintain.

## Data flow for a participant

1. Participant opens a link (from an email, or typed manually):
   `.../exec?email=...&code=...` (bound) or
   `.../exec?event=<id>&email=...&code=...` (standalone).
2. `doGet` resolves the EventContext, sees the visitor isn't a
   recognized admin, and serves `ParticipantPortal.html` with the email/
   code pre-filled from the URL.
3. The page auto-submits, calling
   `participantValidateAndGetCertData(eventId, email, code)` via
   `google.script.run`.
4. The server looks up the row, reads `Config.FieldPositions` (set by the
   admin), reads the certificate background image from Drive, and
   returns: the image as a base64 data URL, the image's pixel dimensions,
   and a list of `{x, y, fontSize, color, fontFamily, align, text}`
   entries - one per positioned field, with `text` already filled in
   from that participant's row.
5. The browser draws the image onto a `<canvas>`, then `fillText`s each
   field at its position. **This is the entire "generation" step** -
   there is no server-side rendering, no temporary file, nothing written
   to Drive for the certificate itself.
6. "Download as PNG" reads the canvas via `toDataURL()`. "Download as
   PDF" wraps that same canvas image in a single-page PDF via jsPDF
   (loaded from a CDN, runs entirely in the browser). Either button also
   fires `participantConfirmDownload`, which sets `Downloaded = true` on
   first call and does nothing on every call after that (idempotent, by
   design - repeat downloads shouldn't change anything).

## Why the field image is fetched as a base64 data URL, not linked directly

`<canvas>.toDataURL()` throws a security error ("tainted canvas") for any
image loaded cross-origin without the right CORS headers - and Google
Drive's direct-download links don't reliably set those. Fetching the
image server-side (`DriveApp`) and inlining it as a `data:` URL sidesteps
this entirely: a data URL is same-origin by definition, so the canvas is
never tainted and downloads always work.

## Extending this

- **New field types**: nothing to do - see `src/core/Fields.gs`. Any
  Participants column that isn't in `SYSTEM_COLUMNS_` is automatically a
  field.
- **A different data store** (e.g. Airtable instead of Sheets): replace
  `SheetStore.gs`, `Config.gs`, and the Sheet-specific bits of
  `Participants.gs`/`Auth.gs` with equivalents that talk to your store,
  keeping the same function signatures. Nothing in `Web.gs`, the shells,
  or the UI should need to change.
- **A third shell** (e.g. a multi-tenant hosted version): add
  `src/<newshell>/`, implement `resolveEventContext_`, add a build target
  in `scripts/build.js`. That's the entire contract.
