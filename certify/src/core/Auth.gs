/**
 * Auth.gs — admin authorization.
 *
 * The check itself is shared, but WHERE the "Admins" list lives differs
 * per shell: in bound mode it's a tab in the event's own Sheet; in
 * standalone mode it's a tab in the shared registry hub (so one admin
 * list covers every event). Each shell passes in the right Spreadsheet
 * as `adminsSs` - this module doesn't know or care which one it is.
 */

var SHEET_ADMINS = 'Admins';

function getActiveEmail_() {
  try {
    var email = Session.getActiveUser().getEmail();
    return email || '';
  } catch (err) {
    return '';
  }
}

function getAdminEmails_(adminsSs) {
  var sheet = getSheetOrThrow_(adminsSs, SHEET_ADMINS);
  var values = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < values.length; i++) {
    var v = (values[i][0] || '').toString().trim().toLowerCase();
    if (v) list.push(v);
  }
  if (list.length === 0) {
    // Safety net: never lock everyone out if the Admins tab is empty -
    // the owner of the spreadsheet holding it is always an implicit admin.
    try {
      var owner = DriveApp.getFileById(adminsSs.getId()).getOwner();
      if (owner) list.push(owner.getEmail().toLowerCase());
    } catch (err) { /* ignore */ }
  }
  return list;
}

function isEmailAdmin_(email, adminsSs) {
  email = (email || '').toLowerCase();
  if (!email) return false;
  return getAdminEmails_(adminsSs).indexOf(email) !== -1;
}

function requireAdmin_(adminsSs) {
  var email = getActiveEmail_();
  if (!email || !isEmailAdmin_(email, adminsSs)) {
    throw new Error('Not authorized. Open this tool using the Admin link while signed in to an approved Google account, and make sure that account is listed in the Admins tab.');
  }
  return email;
}
