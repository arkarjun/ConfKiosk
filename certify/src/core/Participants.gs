/**
 * Participants.gs — reads/writes the Participants tab.
 *
 * Every function here takes an `ctx` (EventContext: { ss, adminsSs,
 * eventId }, produced by the active shell's resolveEventContext_) rather
 * than assuming a single global Spreadsheet - see docs/ARCHITECTURE.md.
 */

var SHEET_PARTICIPANTS = 'Participants';

// Only these are truly required, regardless of which extra custom
// columns a deployer adds for their own certificate fields.
var REQUIRED_PARTICIPANT_HEADERS = [
  'Name', 'Email', 'Code', 'SendEmail', 'EmailStatus', 'SentDate', 'Downloaded', 'FirstDownloadDate'
];

function requireParticipantHeaders_(sheet) {
  var map = getHeaderMap_(sheet);
  REQUIRED_PARTICIPANT_HEADERS.forEach(function (h) {
    if (map[h] === undefined) throw new Error('Missing required column in Participants tab: ' + h);
  });
  return map;
}

function listParticipants_(ctx) {
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  var values = sheet.getDataRange().getValues();
  if (values.length < 1) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = { rowIndex: i + 1 };
    headers.forEach(function (h, colIdx) { row[h] = values[i][colIdx]; });
    if (row.Name || row.Email) rows.push(row); // skip fully blank rows
  }
  return rows;
}

function updateSendFlag_(ctx, rowIndex, value) {
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  var map = getHeaderMap_(sheet);
  if (map['SendEmail'] === undefined) throw new Error('SendEmail column missing.');
  sheet.getRange(rowIndex, map['SendEmail'] + 1).setValue(!!value);
  return true;
}

function generateCodesForAll_(ctx) {
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  var map = requireParticipantHeaders_(sheet);
  var data = getAllDataRows_(sheet);

  var used = {};
  data.forEach(function (r) {
    var c = r[map['Code']];
    if (c) used[c.toString().toUpperCase()] = true;
  });

  var generated = 0;
  for (var i = 0; i < data.length; i++) {
    var name = data[i][map['Name']];
    var email = data[i][map['Email']];
    if (!name && !email) continue; // skip blank rows

    var rowNum = i + 2;
    if (!data[i][map['Code']]) {
      var code = generateUniqueCode_(used);
      used[code] = true;
      sheet.getRange(rowNum, map['Code'] + 1).setValue(code);
      generated++;
    }
    var sendVal = data[i][map['SendEmail']];
    if (sendVal !== true && sendVal !== false) {
      sheet.getRange(rowNum, map['SendEmail'] + 1).setValue(true); // default checked
    }
    if (!data[i][map['EmailStatus']]) {
      sheet.getRange(rowNum, map['EmailStatus'] + 1).setValue('Pending');
    }
  }
  return { generated: generated };
}

function findParticipantByEmailCode_(ctx, email, code) {
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  var map = getHeaderMap_(sheet);
  var data = getAllDataRows_(sheet);
  email = (email || '').trim().toLowerCase();
  code = (code || '').trim().toUpperCase();
  for (var i = 0; i < data.length; i++) {
    var rowEmail = (data[i][map['Email']] || '').toString().trim().toLowerCase();
    var rowCode = (data[i][map['Code']] || '').toString().trim().toUpperCase();
    if (rowEmail === email && rowCode === code) {
      return { rowNum: i + 2, row: data[i], map: map, sheet: sheet };
    }
  }
  return null;
}

function markDownloaded_(ctx, email, code) {
  var found = findParticipantByEmailCode_(ctx, email, code);
  if (!found) return false;
  var map = found.map;
  if (map['Downloaded'] === undefined || map['FirstDownloadDate'] === undefined) return false;
  // Idempotent: first download sets the flag + timestamp; repeat
  // downloads leave both unchanged, by design.
  if (!found.row[map['Downloaded']]) {
    found.sheet.getRange(found.rowNum, map['Downloaded'] + 1).setValue(true);
    found.sheet.getRange(found.rowNum, map['FirstDownloadDate'] + 1).setValue(new Date());
  }
  return true;
}
