import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// replace Food and Swap imports
app = app.replace(/import \{ Food, Swap, Receipt, ReceiptItem \} from "\.\/types";/, 'import { Receipt, ReceiptItem } from "./types";\nimport { Food } from "./data";');
app = app.replace(/import \{ Food \} from "\.\/types";/, 'import { Food } from "./data";');

// Find all `SWAPS` references and comment them out, or fix them.
// "src/App.tsx(1563,5): error TS2552: Cannot find name 'SWAPS'. Did you mean 'Swap'?"
// Let's remove the SWAPS blocks.
// I will just replace `SWAPS` with `[]` where it's used.
app = app.replace(/\bSWAPS\b/g, '[]');

fs.writeFileSync('src/App.tsx', app);

let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/import \{ Food \} from '\.\/data';/, 'export { Food } from "./data";');
fs.writeFileSync('src/types.ts', types);

if (fs.existsSync('src/dataExtra.ts')) {
    let extra = fs.readFileSync('src/dataExtra.ts', 'utf8');
    extra = extra.replace(/import \{ Food, Swap \} from "\.\/types";/, 'import { Food } from "./data";');
    extra = extra.replace(/\bSWAPS\b/g, '[]');
    fs.writeFileSync('src/dataExtra.ts', extra);
}

