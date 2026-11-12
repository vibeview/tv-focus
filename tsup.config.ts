import { defineConfig } from 'tsup';

// TV browsers are old: LG webOS 6 is Chrome 79, older Samsung and LG models older still.
const target = 'es2015';

// The two entries build in parallel, so neither cleans dist (one could delete
// what the other already wrote): `yarn build` empties it before tsup runs.

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/norigin.ts'],
    format: ['cjs', 'esm'],
    target,
    dts: true,
    clean: false,
  },
  {
    // A plain <script> build for pages without a bundler: window.VibeViewFocus.setFocused(...)
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    globalName: 'VibeViewFocus',
    target,
    clean: false,
    outExtension: () => ({ js: '.global.js' }),
  },
]);
