import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{\[\]\.map\(\(swap, index\) => \{/, '{recommendedSwaps.map((swap, index) => {');

fs.writeFileSync('src/App.tsx', code);
