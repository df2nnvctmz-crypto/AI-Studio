import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// I will just change the type of STATIC_TRANSLATIONS by searching for `const STATIC_TRANSLATIONS:`
app = app.replace(/const STATIC_TRANSLATIONS: \{[\s\S]*?\} = \{/g, "const STATIC_TRANSLATIONS: any = {");
// wait, maybe it was `const STATIC_TRANSLATIONS: Record<string, { ... }>`?
// Actually I replaced it with `const STATIC_TRANSLATIONS: any = {` earlier, but maybe it didn't match.

// Let's just find `const STATIC_TRANSLATIONS` and completely delete all lines inside its block until the NEXT constant or function definition.
const lines = app.split('\n');
const startIndex = lines.findIndex(l => l.includes('const STATIC_TRANSLATIONS'));
if (startIndex !== -1) {
    let braces = 0;
    let endIndex = startIndex;
    for(let i=startIndex; i<lines.length; i++) {
        if (lines[i].includes('{')) braces += (lines[i].match(/\{/g) || []).length;
        if (lines[i].includes('}')) braces -= (lines[i].match(/\}/g) || []).length;
        if (braces === 0 && i > startIndex) {
            endIndex = i;
            break;
        }
    }
    // delete the whole block!
    lines.splice(startIndex, endIndex - startIndex + 1);
}

app = lines.join('\n');
app = app.replace(/import \{ Receipt, ReceiptItem, Swap \} from "\.\/types";/g, 'import { Receipt, ReceiptItem } from "./types";');

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/subCategory\?: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
fs.writeFileSync('src/data.ts', dataTs);

