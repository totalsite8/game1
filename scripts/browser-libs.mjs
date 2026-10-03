// Minimal sandbox helper. CI can instead install Playwright's system dependencies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
const dir = '/tmp/route-browser-libs';
mkdirSync(dir, { recursive: true });
writeFileSync(
  `${dir}/al2023.tar`,
  brotliDecompressSync(readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br'))
);
execFileSync('tar', ['xf', `${dir}/al2023.tar`, '-C', dir]);
