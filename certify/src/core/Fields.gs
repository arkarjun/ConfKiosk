/**
 * Fields.gs — data-driven field discovery.
 *
 * The set of fields you can position on a certificate is NOT hardcoded.
 * Any column in the Participants tab that isn't one of the reserved
 * bookkeeping columns below is automatically offered as a positionable
 * field in the Admin panel. Want a certificate with "Team Name" or
 * "Hours Completed" or "Certificate Number"? Just add that column to
 * Participants - no code changes needed.
 */

var SYSTEM_COLUMNS_ = [
  'Email', 'Code', 'SendEmail', 'EmailStatus', 'SentDate', 'Downloaded', 'FirstDownloadDate'
];

function isSystemColumn_(header) {
  var h = (header || '').toString().trim().toLowerCase();
  return SYSTEM_COLUMNS_.some(function (c) { return c.toLowerCase() === h; });
}

/** Ordered list of column headers available as positionable fields -
 *  everything in the Participants tab except the bookkeeping columns. */
function getAvailableFields_(participantsSheet) {
  var map = getHeaderMap_(participantsSheet);
  var headers = Object.keys(map).sort(function (a, b) { return map[a] - map[b]; });
  return headers.filter(function (h) { return !isSystemColumn_(h); });
}

/** Lowercase-keyed lookup of one row's values, keyed by header text, for
 *  matching against FieldPositions entries (which store the exact header
 *  text as `field`, matched case-insensitively so casing changes in the
 *  sheet don't break existing saved positions). */
function buildFieldValueLookup_(rowArray, headerMap) {
  var values = {};
  Object.keys(headerMap).forEach(function (header) {
    values[header.toLowerCase()] = rowArray[headerMap[header]];
  });
  return values;
}

if (typeof module !== 'undefined') {
  module.exports = {
    isSystemColumn_: isSystemColumn_,
    buildFieldValueLookup_: buildFieldValueLookup_,
    SYSTEM_COLUMNS_: SYSTEM_COLUMNS_
  };
}
