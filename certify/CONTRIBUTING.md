# Contributing

Thanks for considering it. This is a small project, so the bar is mostly
"does it fit the existing shape."

## Before a big PR, open an issue first

Especially for a new shell, a new data-store backend, or anything that
touches the `EventContext` contract in `src/core/Web.gs` - let's agree on
the approach before you write a lot of code that might not land.

## Where things go

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first. In short:

- **`src/core/`** - anything that should work identically regardless of
  bound vs. standalone. If your change needs to know which mode is
  active, it probably belongs in a shell instead, or the core function
  needs an extra parameter rather than a mode check.
- **`src/bound/`** / **`src/standalone/`** - only `resolveEventContext_`
  and the one-time setup helpers. Keep these files small; if you're
  adding real logic here, it likely belongs in `core/` with the shell
  just supplying data.
- **`src/ui/`** - shared by both shells. Don't add anything here that
  assumes `EVENT_ID` is always empty (that's true in bound mode, not in
  standalone).

## Running things locally

```
npm install
npm test              # runs test/run-all.js - fast, no Google account needed
npm run build:bound
npm run build:standalone
```

The test suite only covers pure logic (`Codes.gs`, `Email.gs`'s template
filling, `Fields.gs`'s column filtering) - anything touching
`SpreadsheetApp`, `DriveApp`, or `MailApp` needs a real deployment to
verify manually. If you're adding a function to `core/` that has any pure
logic worth isolating, please do (see the existing `module.exports`
guards at the bottom of `Codes.gs`, `Fields.gs`, `Email.gs` for the
pattern - it's just `if (typeof module !== 'undefined')`, which is a
no-op inside real Apps Script).

## Style

Plain ES5-ish JS (Apps Script's V8 runtime supports modern syntax, but
this codebase intentionally stays simple and dependency-free - no
bundler, no transpiler, no framework). Trailing underscore (`_`) on a
function name means "not meant to be called from the client via
`google.script.run`" - it's a convention only, Apps Script doesn't
enforce it, but please keep following it.

## Reporting a security issue

If it's something that could expose participant data or admin access
(not just "codes don't expire," which is a known, documented trade-off -
see the README), please open an issue marked clearly rather than a PR
with the fix in the open, so deployers can be given a heads-up first.
