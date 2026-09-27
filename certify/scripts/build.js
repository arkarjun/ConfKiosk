#!/usr/bin/env node
/**
 * build.js — assembles one deployable Apps Script project under build/<target>/
 * by copying the shared core modules + shared UI + the chosen shell's own
 * files into one flat directory. This is what `clasp push` (via `npm run
 * push:bound` / `push:standalone`) actually pushes to Google.
 *
 * Why a build step at all, if it's just a copy? Because a bound script
 * must physically be its own Apps Script project id (tied to one Sheet)
 * and a standalone script must be a DIFFERENT, separate project id - they
 * can't share one `clasp push` target. This keeps the source (src/core)
 * written once, while still producing two independent, deployable
 * projects. See docs/ARCHITECTURE.md.
 *
 * Usage: node scripts/build.js <bound|standalone>
 */

const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (target !== 'bound' && target !== 'standalone') {
  console.error('Usage: node scripts/build.js <bound|standalone>');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'build', target);

function copyFile(src, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
  return dest;
}

function copyDirFlat(srcDir, destDir, filterExt) {
  if (!fs.existsSync(srcDir)) return [];
  const copied = [];
  fs.readdirSync(srcDir).forEach((name) => {
    const srcPath = path.join(srcDir, name);
    if (fs.statSync(srcPath).isFile()) {
      if (!filterExt || filterExt.some((ext) => name.endsWith(ext))) {
        copied.push(copyFile(srcPath, destDir));
      }
    }
  });
  return copied;
}

// Clean slate for this target.
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const copied = [];
copied.push(...copyDirFlat(path.join(root, 'src', 'core'), outDir, ['.gs']));
copied.push(...copyDirFlat(path.join(root, 'src', target), outDir, ['.gs']));
copied.push(...copyDirFlat(path.join(root, 'src', 'ui'), outDir, ['.html']));
copied.push(copyFile(path.join(root, 'appsscript.json'), outDir));

// A minimal .claspignore inside the build dir keeps `clasp push` from ever
// picking up anything unexpected, even though this directory only ever
// contains what we just copied.
fs.writeFileSync(path.join(outDir, '.claspignore'), '**/**\n!*.gs\n!*.html\n!appsscript.json\n');

console.log(`Built ${target} -> ${path.relative(root, outDir)}/ (${copied.length} files)`);
copied.forEach((f) => console.log('  ' + path.relative(root, f)));
console.log('');
console.log(`Next: cd build/${target} && clasp login (first time only), then clasp create/clone + clasp push.`);
console.log(`See docs/SETUP_${target.toUpperCase()}.md for the full walkthrough.`);
