/**
 * Render.gs — assembles the data a participant's browser needs to draw
 * their certificate on a <canvas>, using the data-driven field list.
 * No file is ever generated or stored server-side: the client renders
 * and saves the PNG/PDF itself (see src/ui/ParticipantPortal.html).
 */

function getOrCreateTemplatesFolder_(ss) {
  var parents = DriveApp.getFileById(ss.getId()).getParents();
  var parentFolder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  var folderName = 'certificate_templates';
  var existing = parentFolder.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  return parentFolder.createFolder(folderName);
}

function uploadTemplateImage_(ss, base64Data, filename, mimeType) {
  var folder = getOrCreateTemplatesFolder_(ss);
  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType, filename);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { fileId: file.getId(), name: file.getName() };
}

function getImageDataUrl_(fileId) {
  if (!fileId) return null;
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  var base64 = Utilities.base64Encode(blob.getBytes());
  return 'data:' + blob.getContentType() + ';base64,' + base64;
}

function buildCertData_(ctx, email, code) {
  var found = findParticipantByEmailCode_(ctx, email, code);
  if (!found) {
    return { ok: false, error: 'We could not find a certificate for that email and code. Please double-check and try again.' };
  }
  var config = getConfig_(ctx.ss);
  var imageDataUrl = getImageDataUrl_(config.TemplateFileId);
  if (!imageDataUrl) {
    return { ok: false, error: 'The certificate template has not been set up yet. Please contact the organizers.' };
  }
  var values = buildFieldValueLookup_(found.row, found.map);
  var fields = (config.FieldPositions || []).map(function (f) {
    return {
      field: f.field,
      x: f.x, y: f.y,
      fontSize: f.fontSize || 32,
      color: f.color || '#000000',
      fontFamily: f.fontFamily || 'Arial',
      align: f.align || 'center',
      text: values[(f.field || '').toLowerCase()] || ''
    };
  });
  return {
    ok: true,
    imageDataUrl: imageDataUrl,
    imageWidth: config.ImageWidth || 1200,
    imageHeight: config.ImageHeight || 850,
    fields: fields
  };
}
