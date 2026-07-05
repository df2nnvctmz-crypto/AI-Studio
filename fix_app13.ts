import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Replace everything between `Record<string, {` and `}> = {`
const regex = /Record<string, \{[\s\S]*?\}> = \{/;
app = app.replace(regex, 'any = {');

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
const regex2 = /subCategory\?: string;\s+subCategory\?: string;/g;
dataTs = dataTs.replace(regex2, 'subCategory?: string;');
fs.writeFileSync('src/data.ts', dataTs);

