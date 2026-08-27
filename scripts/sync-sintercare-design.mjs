/**
 * Copy `src/templates/sintercare/EDITABLE.svg` → `public/sintercare/design.svg`
 * (HTML preview + pasted signatures). PNG uses `EDITABLE.svg` from `src/` directly.
 * Run: npm run sintercare:sync-design
 */
import fs from 'fs';
import { join } from 'path';

const root = process.cwd();
const src = join(root, 'src', 'templates', 'sintercare', 'EDITABLE.svg');
const dest = join(root, 'public', 'sintercare', 'design.svg');
fs.copyFileSync(src, dest);
console.log('copied', src, '→', dest);
