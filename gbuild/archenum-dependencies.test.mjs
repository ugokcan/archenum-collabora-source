import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Bundled OpenSSL's link dependency does not propagate its headers in gbuild.
// Do not let a developer machine's system libssl-dev hide missing declarations.
for (const file of readdirSync(new URL('.', import.meta.url)).filter(name => /^Executable_.*\.mk$/.test(name))) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  if (!/^\s+openssl\s+\\$/m.test(source)) continue;
  test(`${file} declares bundled OpenSSL headers explicitly`, () => {
    assert.match(source, /^\s+openssl_headers\s+\\$/m);
  });
}
