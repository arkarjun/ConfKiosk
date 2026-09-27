/**
 * Tests for src/core/Codes.gs. Runs directly under Node - Codes.gs has no
 * Apps Script API calls, so it's required here as plain JS.
 */
const assert = require('assert');
const { generateUniqueCode_, CODE_ALPHABET_, CODE_LENGTH_ } = require('../src/core/Codes.gs');

module.exports = function run() {
  // Correct length and alphabet
  const used = {};
  const code = generateUniqueCode_(used);
  assert.strictEqual(code.length, CODE_LENGTH_, 'code should be ' + CODE_LENGTH_ + ' characters');
  for (const ch of code) {
    assert.ok(CODE_ALPHABET_.indexOf(ch) !== -1, 'code character "' + ch + '" not in allowed alphabet');
  }

  // Excludes visually-confusing characters
  ['0', 'O', '1', 'I', 'L'].forEach((bad) => {
    assert.ok(CODE_ALPHABET_.indexOf(bad) === -1, 'alphabet should not include "' + bad + '"');
  });

  // Never returns an already-used code
  const usedSet = {};
  for (let i = 0; i < 200; i++) {
    const c = generateUniqueCode_(usedSet);
    assert.ok(!usedSet[c], 'generated a code that was already marked used: ' + c);
    usedSet[c] = true;
  }

  console.log('  codes.test.js: ok');
};
