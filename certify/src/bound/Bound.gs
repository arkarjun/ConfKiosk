/**
 * Bound.gs — the DEFAULT, quickstart shell.
 *
 * This script is bound to a single event's Google Sheet (opened via
 * Extensions > Apps Script from that Sheet). The Sheet itself holds all
 * three tabs: Participants, Config and Admins.
 *
 * Use this shell if you're running one certificate program and want the
 * simplest possible setup: make a copy of the template Sheet, paste this
 * code in, deploy twice, done. No registry, no second spreadsheet.
 * To run another event, make another copy - see docs/SETUP_BOUND.md.
 */

function resolveEventContext_(eventId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return { ss: ss, adminsSs: ss, eventId: null };
}

/** Run once from the Apps Script editor's function dropdown to add
 *  yourself as an admin (also confirms the script is authorized). */
function setupAddMeAsAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetOrThrow_(ss, SHEET_ADMINS);
  var me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  if (!me) throw new Error('Could not determine your email. Run this from the Apps Script editor while logged in.');
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if ((values[i][0] || '').toString().trim().toLowerCase() === me.toLowerCase()) {
      return 'Already an admin: ' + me;
    }
  }
  sheet.appendRow([me]);
  return 'Added as admin: ' + me;
}
