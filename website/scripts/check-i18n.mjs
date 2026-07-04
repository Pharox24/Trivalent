// Verifies AR and ZH dictionaries mirror the EN master exactly:
// same key paths, same array lengths, same nested shapes.
import { en } from '../src/i18n/en.ts';
import { ar } from '../src/i18n/ar.ts';
import { zh } from '../src/i18n/zh.ts';

const keyPaths = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    if (Array.isArray(v)) {
      const self = [`${prefix}${k}[len=${v.length}]`];
      return self.concat(
        v.flatMap((item, i) =>
          item && typeof item === 'object' ? keyPaths(item, `${prefix}${k}[${i}].`) : []
        )
      );
    }
    if (v && typeof v === 'object') return keyPaths(v, `${prefix}${k}.`);
    return [`${prefix}${k}`];
  });

const base = new Set(keyPaths(en));
let failed = false;
for (const [name, dict] of [['ar', ar], ['zh', zh]]) {
  const keys = new Set(keyPaths(dict));
  const missing = [...base].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`[i18n] ${name}: missing=${missing.join(',') || '-'} extra=${extra.join(',') || '-'}`);
  }
}
if (failed) process.exit(1);
console.log('[i18n] all dictionaries in parity');
