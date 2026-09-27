# Certificate Generator

A free, self-hosted certificate tool built entirely on Google Sheets + Apps
Script. No server to run, no third-party service to pay for or trust with
participant data - everything lives in your own Google account.

- **Admin uploads a design once**, drags six-or-however-many fields into
  position visually, and manages a participant list in a plain Sheet.
- **Participants self-serve**: they get an emailed link (or type in an
  email + code), and their certificate is rendered live in their own
  browser as a `<canvas>` and downloaded as a PNG or PDF. **Nothing is
  ever generated or stored on the server** - not even temporarily.
- **Fields are data-driven.** Add a column to your Participants sheet
  (`TeamName`, `HoursCompleted`, `CertificateNumber`, whatever your
  certificate needs) and it shows up in the positioning UI automatically.
  No code changes, ever, for a new field.

## Which deployment mode do I want?

| | **Bound** (default, quickstart) | **Standalone + Registry** (advanced) |
|---|---|---|
| Best for | One certificate program / one event | Running this for many events over time |
| Setup | Make a copy of a Sheet, paste code in, deploy | Set up once; add a row per new event afterward |
| URLs | New pair of URLs per event | One pair of URLs, forever |
| Admins | Per-event Admins tab | One shared Admins tab across all events |
| Needs | Nothing beyond a Google account | Comfortable creating a standalone Apps Script project + a Script Property |
| Guide | [docs/SETUP_BOUND.md](docs/SETUP_BOUND.md) | [docs/SETUP_STANDALONE.md](docs/SETUP_STANDALONE.md) |

If you're not sure, start with **Bound** - it's the simpler path and
nothing stops you from moving to Standalone later.

## How it's put together

Both modes share the exact same core logic (`src/core/`) - the only
difference between them is a handful of lines that decide *which*
Spreadsheet to operate on for a given request. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) if you're contributing or
just curious how the two modes share one codebase.

```
src/
  core/         shared logic - auth, config, fields, codes, email, render, web
  bound/        the "one event, one Sheet" shell (default)
  standalone/   the "one script, many events via a registry" shell
  ui/           AdminPanel.html + ParticipantPortal.html, shared by both
templates/      starter CSVs for each Sheet tab, ready to import
docs/           setup guides + architecture notes
test/           dependency-free Node tests for the pure logic
scripts/        build.js - assembles a deployable project per shell
```

## Quickstart (Bound mode)

```
npm install
npm run build:bound          # assembles build/bound/ from src/core + src/bound + src/ui
cd build/bound
clasp login                  # one-time, opens a browser for Google sign-in
clasp create --type sheets --title "My Certificate Generator"
clasp push
```

Then follow [docs/SETUP_BOUND.md](docs/SETUP_BOUND.md) from "Deploy #1"
onward - deploying twice (participant + admin links), and configuring
everything from the Admin panel. If you'd rather not touch a terminal at
all, the same guide includes a fully manual, copy-paste-into-the-browser
path.

## Security model, plainly stated

- Participant access is **email + a 6-character code**, checked against
  your Participants sheet. Codes don't expire and aren't one-time-use by
  default - a forwarded email lets someone else view/download that
  person's certificate. This is a deliberate simplicity trade-off; PRs
  adding optional expiry/one-time-use are welcome.
- Admin access requires signing in with a Google account **and** being
  listed in an Admins tab (the Sheet's owner is always an implicit admin,
  even if that tab is empty, so you can never lock yourself out).
- All participant data - names, emails, generated certificates - stays
  inside your own Google account. Nothing is sent to any third party.
  The only external network call the pages make is loading the jsPDF
  library from a CDN, used purely client-side to build the PDF download.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports, new field types,
theming, and a third shell (say, a multi-tenant SaaS-style deployment) are
all fair game - open an issue to discuss before a big PR.

## License

MIT - see [LICENSE](LICENSE).
