import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The lines with STATIC_TRANSLATIONS start at `const STATIC_TRANSLATIONS` and end when `};`
let start = app.indexOf('const STATIC_TRANSLATIONS');
if (start !== -1) {
    let end = app.indexOf('};', start);
    if (end !== -1) {
        app = app.substring(0, start) + app.substring(end + 2);
    }
}

// Remove verdict from mock objects
app = app.replace(/verdict: "[^"]*",/g, "");
app = app.replace(/positives: \[[^\]]*\],/g, "");
app = app.replace(/negatives: \[[^\]]*\],/g, "");

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
// remove duplicate subCategory
const regex = /subCategory\?: string;\s+subCategory\?: string;/g;
dataTs = dataTs.replace(regex, 'subCategory?: string;');
fs.writeFileSync('src/data.ts', dataTs);

