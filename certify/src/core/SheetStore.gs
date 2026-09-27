/**
 * SheetStore.gs — low-level helpers for reading a Sheet by tab name.
 *
 * Shared by both deployment shells (bound and standalone). This module
 * knows nothing about WHICH Spreadsheet it's talking to - every function
 * takes the Spreadsheet (`ss`) as a parameter. Resolving which Spreadsheet
 * that is for a given request is the one job each shell (bound/Bound.gs
 * or standalone/Standalone.gs) exists to do - see docs/ARCHITECTURE.md.
 */

function getSheetOrThrow_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('Missing sheet tab: "' + name + '". See the setup guide to create it.');
  }
  return sheet;
}

function getHeaderMap_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) {
    if (h) map[h.toString().trim()] = i;
  });
  return map;
}

function getAllDataRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var numCols = sheet.getLastColumn();
  return sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
}
