#!/usr/bin/env node
/**
 * Minimal dependency-free test runner - `npm test` runs this.
 * Each test/*.test.js file exports a function that throws (via
 * assert) on failure and returns normally on success.
 */
const path = require('path');

const tests = ['codes.test.js', 'email-template.test.js', 'fields.test.js'];

let failed = 0;
console.log('Running tests:\n');
tests.forEach((file) => {
  try {
    require(path.join(__dirname, file))();
  } catch (err) {
    failed++;
    console.error('  ' + file + ': FAILED');
    console.error('    ' + err.message);
  }
});

console.log('');
if (failed > 0) {
  console.error(failed + ' test file(s) failed.');
  process.exit(1);
} else {
  console.log('All tests passed.');
}
