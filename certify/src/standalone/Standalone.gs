/**
 * Standalone.gs — the ADVANCED, multi-event shell.
 *
 * This script is its OWN Drive item (Apps Script > New project - not
 * attached to any Sheet). It holds one Script Property, REGISTRY_SHEET_ID,
 * pointing at a "hub" Google Sheet with two tabs:
 *   - Events: EventId, EventName, SheetId, Active
 *   - Admins: Email  (global admins, trusted across every registered event)
 *
 * Each event still gets its own Sheet (Participants + Config tabs, same
 * shape as the bound version, but WITHOUT its own Admins tab - admin
 * access is decided by the hub's Admins tab instead).
 *
 * Use this shell if you (or your org) will run this for many events over
 * time and want ONE pair of URLs, forever - a new event is a new row in
 * the registry, not a new deployment. See docs/SETUP_STANDALONE.md.
 */

function getRegistrySpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('REGISTRY_SHEET_ID');
  if (!id) {
    throw new Error('Registry not configured. Run setupSetRegistrySheetId(id) once from the Apps Script editor. See docs/SETUP_STANDALONE.md.');
  }
  return SpreadsheetApp.openById(id);
}

function resolveEventContext_(eventId) {
  if (!eventId) {
    throw new Error('Missing "event" parameter. Use a link like ?event=<id>&email=...');
  }
  var registry = getRegistrySpreadsheet_();
  var eventsSheet = getSheetOrThrow_(registry, 'Events');
  var map = getHeaderMap_(eventsSheet);
  ['EventId', 'SheetId'].forEach(function (h) {
    if (map[h] === undefined) throw new Error('Registry "Events" tab is missing column: ' + h);
  });
  var data = getAllDataRows_(eventsSheet);
  for (var i = 0; i < data.length; i++) {
    if ((data[i][map['EventId']] || '').toString().trim() === eventId) {
      if (map['Active'] !== undefined && data[i][map['Active']] === false) {
        throw new Error('This event is not currently active.');
      }
      var sheetId = data[i][map['SheetId']];
      var ss = SpreadsheetApp.openById(sheetId);
      return { ss: ss, adminsSs: registry, eventId: eventId };
    }
  }
  throw new Error('Unknown event: "' + eventId + '". Check the link, or ask the organizer to add it to the registry.');
}

/** Run once from the Apps Script editor, after creating your hub
 *  Registry Sheet, to point this script at it. Pass the Sheet's file ID
 *  (from its URL: docs.google.com/spreadsheets/d/<ID>/edit). */
function setupSetRegistrySheetId(registrySheetId) {
  if (!registrySheetId) throw new Error("Pass the Registry Sheet's file ID.");
  PropertiesService.getScriptProperties().setProperty('REGISTRY_SHEET_ID', registrySheetId);
  return 'Registry set to: ' + registrySheetId;
}

/** Run once to add yourself as a global admin in the registry hub. */
function setupAddMeAsAdmin() {
  var registry = getRegistrySpreadsheet_();
  var sheet = getSheetOrThrow_(registry, SHEET_ADMINS);
  var me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  if (!me) throw new Error('Could not determine your email.');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if ((values[i][0] || '').toString().trim().toLowerCase() === me.toLowerCase()) {
      return 'Already an admin: ' + me;
    }
  }
  sheet.appendRow([me]);
  return 'Added as admin: ' + me;
}
