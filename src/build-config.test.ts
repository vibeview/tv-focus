// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * tsup runs the entries of an array config in parallel: a `clean: true` on one
 * of them can delete what the other already wrote (the browser build,
 * `index.global.js`). So no entry cleans; the build script empties dist first.
 */
const root = new URL('../', import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), 'utf8');

describe('the build', () => {
  it('no tsup entry cleans dist (they run in parallel)', () => {
    const config = read('tsup.config.ts');
    expect(config).not.toMatch(/clean:\s*true/);
  });

  it('the build script empties dist before tsup runs', () => {
    const scripts = JSON.parse(read('package.json')).scripts as Record<string, string>;
    expect(scripts.build).toMatch(/rmSync\('dist'.*&& tsup$/);
  });
});
