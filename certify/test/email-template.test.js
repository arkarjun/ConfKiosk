/**
 * Tests for src/core/Email.gs's fillTemplate_ (pure string templating).
 */
const assert = require('assert');
const { fillTemplate_ } = require('../src/core/Email.gs');

module.exports = function run() {
  const out = fillTemplate_('Hi {{Name}}, welcome to {{EventName}}!', {
    Name: 'Asha',
    EventName: 'State of the Map Kerala'
  });
  assert.strictEqual(out, 'Hi Asha, welcome to State of the Map Kerala!');

  // Unknown placeholder is left as-is rather than silently dropped, so a
  // typo in Config is easy to spot in a test send.
  const out2 = fillTemplate_('Code: {{Code}}, Team: {{TeamName}}', { Code: 'AB12CD' });
  assert.strictEqual(out2, 'Code: AB12CD, Team: {{TeamName}}');

  // Whitespace inside the braces is tolerated
  const out3 = fillTemplate_('Hello {{ Name }}', { Name: 'Ravi' });
  assert.strictEqual(out3, 'Hello Ravi');

  console.log('  email-template.test.js: ok');
};
