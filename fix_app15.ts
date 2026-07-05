import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/\{translateSwapReason\(swap, language\)\}/g, "{language === 'en' ? 'Healthier option in the same category' : 'Gesündere Option in derselben Kategorie'}");

// Now delete translateSwapReason block
const lines = app.split('\n');
const startIndex = lines.findIndex(l => l.includes('const translateSwapReason'));
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
    // delete the whole block
    lines.splice(startIndex, endIndex - startIndex + 1);
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));

