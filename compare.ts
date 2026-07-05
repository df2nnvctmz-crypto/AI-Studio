import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf-8');
const snippet = code.substring(code.indexOf('const filteredFoods ='), code.indexOf('return categoryMatches && searchMatches && preferenceMatches;'));
console.log(snippet);
