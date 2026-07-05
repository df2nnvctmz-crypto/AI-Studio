import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/food\.nutrients_per_100\.carbs/g, "food.nutrients_per_100.sugar_g");

app = app.replace(/macros:/g, "nutrients_per_100:");
// Just fix the mock objects entirely.
app = app.replace(/nutrients_per_100: \{ protein: ([\d.]+), carbs: ([\d.]+), fiber: ([\d.]+), sugars: ([\d.]+), fat: ([\d.]+), saturatedFat: ([\d.]+), sodium: ([\d.]+) \},?/g, "nutrients_per_100: { protein_g: $1, fiber_g: $3, sugar_g: $4, fat_g: $5, saturated_fat_g: $6, salt_g: $7, kcal: 100 },");
app = app.replace(/micros: \[[^\]]*\]/g, "");

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/nutrients_per_100: Nutrients;/g, 'nutrients_per_100: Nutrients;\n  subCategory?: string;'); // in case subCategory is missing
fs.writeFileSync('src/data.ts', dataTs);

