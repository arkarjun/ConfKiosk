/**
 * Config.gs — generic key/value settings, read from a "Config" tab
 * (columns: Key, Value). Nothing here is specific to any one event -
 * event name, sender name, reply-to, email text and the certificate
 * design (template file + field positions) all live here so the same
 * code works for any deployer's event.
 */

var SHEET_CONFIG = 'Config';

function getConfig_(ss) {
  var sheet = getSheetOrThrow_(ss, SHEET_CONFIG);
  var values = sheet.getDataRange().getValues();
  var config = {};
  for (var i = 1; i < values.length; i++) {
    var key = values[i][0];
    var val = values[i][1];
    if (key) config[key] = val;
  }
  if (config.FieldPositions) {
    try { config.FieldPositions = JSON.parse(config.FieldPositions); }
    catch (err) { config.FieldPositions = []; }
  } else {
    config.FieldPositions = [];
  }
  return config;
}

function setConfig_(ss, configObj) {
  var sheet = getSheetOrThrow_(ss, SHEET_CONFIG);
  var values = sheet.getDataRange().getValues();
  var rowByKey = {};
  for (var i = 1; i < values.length; i++) {
    if (values[i][0]) rowByKey[values[i][0]] = i + 1;
  }
  Object.keys(configObj).forEach(function (key) {
    var val = configObj[key];
    if (key === 'FieldPositions' && typeof val !== 'string') {
      val = JSON.stringify(val);
    }
    if (rowByKey[key]) {
      sheet.getRange(rowByKey[key], 2).setValue(val);
    } else {
      sheet.appendRow([key, val]);
    }
  });
  return getConfig_(ss);
}
