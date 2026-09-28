# ConfKiosk

A low-tech, modular toolkit for running a conference without an IT
team. Built on Google Apps Script — each module is a standalone
script project that self-provisions its own Google Sheet (not bound
to it), so distributing a module is just Drive's "Make a copy," and
Sheet-editor access stays separate from script/secrets access.

Aimed at events under ~200 registrants where standing up Salesforce-
or Eventbrite-grade infrastructure isn't worth it, but a spreadsheet
alone isn't enough either.

## Modules

Each module works on its own — copy just the one you need — but
they're designed to hand off to each other (e.g. an accepted CFP
submission in Talks can mint a speaker's comp code for Tickets).

| Module | What it does | Status |
|---|---|---|
| [**Talks**](./talks) | Collect and manage CFP submissions | Not started |
| [**Tickets**](./tickets) | Register attendees and manage check-in | Built, in testing (code lands here once testing is done) |
| [**Certify**](./certify) | Generate certificates | Built |
| [**Pulse**](./pulse) | Collect post-event/session feedback from attendees | Not started |

See each module's own README for setup and details.

## License

MIT — see [LICENSE](./LICENSE).
