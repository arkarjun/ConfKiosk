# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2026-09-27

Initial open-source restructure.

### Added
- Shared core modules (`src/core/`): Auth, Config, Fields, Codes, Email,
  Participants, Render, Web - all operating on an `EventContext` rather
  than assuming a single global Spreadsheet.
- Two deployment shells: `src/bound/` (default, one event per Sheet) and
  `src/standalone/` (registry-based, one script for many events).
- Data-driven fields: any non-reserved column in the Participants tab is
  automatically offered as a positionable certificate field.
- `clasp`-based build/deploy workflow (`scripts/build.js` +
  `npm run build:bound` / `build:standalone` / `push:bound` /
  `push:standalone`).
- Dependency-free Node test suite for the pure logic (`test/`).
- Setup guides for both modes, an architecture doc, and standard OSS
  scaffolding (LICENSE, CONTRIBUTING.md).

### Changed
- Field positions used to be a hardcoded list of 6 fields; they're now
  discovered from the sheet at runtime.

### Known limitations (tracked, not yet fixed)
- Access codes don't expire and aren't one-time-use.
- No automated tests for the Apps Script–specific code paths (anything
  touching `SpreadsheetApp`/`DriveApp`/`MailApp`) - only the pure logic is
  covered.
- Drag-to-position in the Admin panel is mouse-only; no touch support yet.
