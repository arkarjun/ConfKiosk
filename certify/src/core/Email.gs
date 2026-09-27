/**
 * Email.gs — subject/body templating + batch sending.
 */

function fillTemplate_(tpl, ctx) {
  return tpl.replace(/{{\s*(\w+)\s*}}/g, function (m, key) {
    return ctx.hasOwnProperty(key) ? ctx[key] : m;
  });
}

function sendCertificateEmails_(ctx, portalBaseUrl) {
  var sheet = getSheetOrThrow_(ctx.ss, SHEET_PARTICIPANTS);
  var map = requireParticipantHeaders_(sheet);
  var config = getConfig_(ctx.ss);

  if (!portalBaseUrl) {
    throw new Error('Set "ParticipantPortalUrl" in Config (Admin panel > Settings) before sending emails.');
  }

  var data = getAllDataRows_(sheet);
  var subjectTpl = config.EmailSubject || 'Your certificate for {{EventName}}';
  var bodyTpl = config.EmailBody ||
    'Hi {{Name}},\n\nThank you for taking part in {{EventName}}.\n' +
    'You can download your certificate here:\n{{PortalLink}}\n\n' +
    'If asked, your access code is: {{Code}}\n\nRegards';

  var mailOpts = {};
  if (config.EmailFromName) mailOpts.name = config.EmailFromName;
  if (config.ReplyToEmail) mailOpts.replyTo = config.ReplyToEmail;

  var sent = 0, skipped = 0, errors = [];

  for (var i = 0; i < data.length; i++) {
    var rowNum = i + 2;
    var email = data[i][map['Email']];
    var code = data[i][map['Code']];
    var sendFlag = data[i][map['SendEmail']];
    var status = data[i][map['EmailStatus']];

    if (!email || !code) { skipped++; continue; }
    if (sendFlag === false) { skipped++; continue; }
    if (status === 'Sent') { skipped++; continue; }

    var link = portalBaseUrl + (portalBaseUrl.indexOf('?') === -1 ? '?' : '&') +
      'email=' + encodeURIComponent(email) + '&code=' + encodeURIComponent(code);
    if (ctx.eventId) link += '&event=' + encodeURIComponent(ctx.eventId);

    var mctx = {
      Name: data[i][map['Name']] || '',
      EventName: map['EventName'] !== undefined ? (data[i][map['EventName']] || '') : '',
      EventDate: map['EventDate'] !== undefined ? (data[i][map['EventDate']] || '') : '',
      Designation: map['Designation'] !== undefined ? (data[i][map['Designation']] || '') : '',
      Affiliation: map['Affiliation'] !== undefined ? (data[i][map['Affiliation']] || '') : '',
      Role: map['Role'] !== undefined ? (data[i][map['Role']] || '') : '',
      Code: code,
      PortalLink: link
    };

    var subject = fillTemplate_(subjectTpl, mctx);
    var body = fillTemplate_(bodyTpl, mctx);

    try {
      var opts = { subject: subject, body: body };
      if (mailOpts.name) opts.name = mailOpts.name;
      if (mailOpts.replyTo) opts.replyTo = mailOpts.replyTo;
      MailApp.sendEmail(email, subject, body, opts);
      sheet.getRange(rowNum, map['EmailStatus'] + 1).setValue('Sent');
      sheet.getRange(rowNum, map['SentDate'] + 1).setValue(new Date());
      sent++;
    } catch (err) {
      errors.push(email + ': ' + err.message);
      skipped++;
    }
  }
  return { sent: sent, skipped: skipped, errors: errors };
}

if (typeof module !== 'undefined') {
  module.exports = { fillTemplate_: fillTemplate_ };
}
