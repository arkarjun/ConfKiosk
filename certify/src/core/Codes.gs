/**
 * Codes.gs — unique access-code generation.
 *
 * Pure logic, no Apps Script API calls - kept this way on purpose so it
 * can be unit-tested directly under Node (see test/codes.test.js).
 */

var CODE_ALPHABET_ = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L - avoids visual confusion
var CODE_LENGTH_ = 6;

function generateUniqueCode_(used) {
  var code;
  do {
    code = '';
    for (var j = 0; j < CODE_LENGTH_; j++) {
      code += CODE_ALPHABET_.charAt(Math.floor(Math.random() * CODE_ALPHABET_.length));
    }
  } while (used[code]);
  return code;
}

if (typeof module !== 'undefined') {
  module.exports = { generateUniqueCode_: generateUniqueCode_, CODE_ALPHABET_: CODE_ALPHABET_, CODE_LENGTH_: CODE_LENGTH_ };
}
