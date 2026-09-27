/**
 * Tests for src/core/Fields.gs's pure helpers (system-column filtering
 * and the case-insensitive value lookup). getAvailableFields_ itself
 * touches a live Sheet object, so it's exercised manually against a real
 * deployment instead - see docs/SETUP_BOUND.md.
 */
const assert = require('assert');
const { isSystemColumn_, buildFieldValueLookup_, SYSTEM_COLUMNS_ } = require('../src/core/Fields.gs');

module.exports = function run() {
  SYSTEM_COLUMNS_.forEach((c) => {
    assert.ok(isSystemColumn_(c), '"' + c + '" should be a system column');
    assert.ok(isSystemColumn_(c.toLowerCase()), 'system-column check should be case-insensitive');
  });

  ['Name', 'Designation', 'CertificateNumber', 'HoursCompleted', 'TeamName'].forEach((c) => {
    assert.ok(!isSystemColumn_(c), '"' + c + '" should NOT be treated as a system column');
  });

  const headerMap = { Name: 0, Email: 1, TeamName: 2 };
  const row = ['Asha Menon', 'asha@example.com', 'Mappers United'];
  const values = buildFieldValueLookup_(row, headerMap);
  assert.strictEqual(values['name'], 'Asha Menon');
  assert.strictEqual(values['teamname'], 'Mappers United');

  console.log('  fields.test.js: ok');
};
