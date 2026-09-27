/**
 * Web.gs — the doGet dispatcher and every function exposed to the
 * client via google.script.run. Shared by both shells.
 *
 * Each shell (src/bound/Bound.gs or src/standalone/Standalone.gs) must
 * define resolveEventContext_(eventId), returning:
 *   { ss: Spreadsheet, adminsSs: Spreadsheet, eventId: string|null }
 * - ss is the specific event's Spreadsheet (Participants + Config tabs)
 * - adminsSs is the Spreadsheet holding the Admins tab (same as `ss` in
 *   bound mode; the shared registry hub in standalone mode)
 * This is the ONLY seam between the two shells - nothing else in this
 * file, or in any other core/*.gs module, knows which shell is active.
 */

function doGet(e) {
  var eventId = (e && e.parameter && e.parameter.event) || null;
  var email = getActiveEmail_();

  var ctx;
  try {
    ctx = resolveEventContext_(eventId);
  } catch (err) {
    return HtmlService.createHtmlOutput('<p>' + escapeHtml_(err.message) + '</p>');
  }

  if (email && isEmailAdmin_(email, ctx.adminsSs)) {
    var at = HtmlService.createTemplateFromFile('AdminPanel');
    at.adminEmail = email;
    at.eventId = eventId || '';
    return at.evaluate()
      .setTitle('Certificate Generator - Admin')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  var prefillEmail = (e && e.parameter && e.parameter.email) ? e.parameter.email : '';
  var prefillCode = (e && e.parameter && e.parameter.code) ? e.parameter.code : '';
  var t = HtmlService.createTemplateFromFile('ParticipantPortal');
  t.prefillEmail = prefillEmail;
  t.prefillCode = prefillCode;
  t.eventId = eventId || '';
  return t.evaluate()
    .setTitle('Download Your Certificate')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function escapeHtml_(s) {
  return (s || '').toString().replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// ================= Admin-facing (google.script.run) =================
// Every call takes eventId first (empty string in bound mode, ignored by
// Bound.gs's resolveEventContext_; the actual event id in standalone mode).

function adminGetConfig(eventId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return getConfig_(ctx.ss);
}

function adminSetConfig(eventId, configObj) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return setConfig_(ctx.ss, configObj);
}

function adminGetAvailableFields(eventId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  return getAvailableFields_(sheet);
}

function adminUploadTemplateImage(eventId, base64Data, filename, mimeType) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return uploadTemplateImage_(ctx.ss, base64Data, filename, mimeType);
}

function adminGetTemplateImageDataUrl(eventId, fileId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return getImageDataUrl_(fileId);
}

function adminGetParticipants(eventId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return listParticipants_(ctx);
}

function adminUpdateSendFlag(eventId, rowIndex, value) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return updateSendFlag_(ctx, rowIndex, value);
}

function adminGenerateCodes(eventId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  return generateCodesForAll_(ctx);
}

function adminSendEmails(eventId) {
  var ctx = resolveEventContext_(eventId);
  requireAdmin_(ctx.adminsSs);
  var config = getConfig_(ctx.ss);
  return sendCertificateEmails_(ctx, config.ParticipantPortalUrl);
}

// ================= Participant-facing (public, no auth) =================

function participantValidateAndGetCertData(eventId, email, code) {
  var ctx;
  try {
    ctx = resolveEventContext_(eventId);
  } catch (err) {
    return { ok: false, error: err.message };
  }
  if (!email || !code) return { ok: false, error: 'Please enter both your email and your code.' };
  return buildCertData_(ctx, email, code);
}

function participantConfirmDownload(eventId, email, code) {
  var ctx = resolveEventContext_(eventId);
  return markDownloaded_(ctx, email, code);
}
