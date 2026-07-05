import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import \{ Receipt, ReceiptItem, Swap \} from "\.\/types";/, 'import { Receipt, ReceiptItem } from "./types";');
app = app.replace(/, Swap/g, ""); // just in case
fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/subCategory\?: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
dataTs = dataTs.replace(/subCategory: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
dataTs = dataTs.replace(/subCategory: string;/g, 'subCategory?: string;');

// manually deduplicate subCategory in data.ts
const dataLines = dataTs.split('\n');
let seenSubCategory = false;
const newDataLines = [];
for (const line of dataLines) {
    if (line.includes('subCategory?: string;')) {
        if (!seenSubCategory) {
            seenSubCategory = true;
            newDataLines.push(line);
        }
    } else {
        newDataLines.push(line);
    }
}
fs.writeFileSync('src/data.ts', newDataLines.join('\n'));

