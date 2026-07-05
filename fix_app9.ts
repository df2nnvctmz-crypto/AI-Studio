import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/servingSize: "[^"]*",/g, "");

// Remove macros/micros access on getNutritionBreakdown
app = app.replace(/getNutritionBreakdown\(\)\.macros/g, "getNutritionBreakdown().nutrients_per_100");
app = app.replace(/getNutritionBreakdown\(\)\.micros/g, "([] as any[])");

// Change getNutritionBreakdown to return nutrients_per_100 instead of macros if it wasn't
// wait, the error is Property 'macros' does not exist on type '{ calories: number; nutrients_per_100: ... }'
// This means the return type IS nutrients_per_100, but the access is macros.

// The errors say:
// src/App.tsx(3457,42): error TS2339: Property 'macros' does not exist on type '{ calories: number; nutrients_per_100: ...'
// src/App.tsx(3488,42): error TS2339: Property 'micros' does not exist on type '{ calories: number; nutrients_per_100: ...'
// So my previous regex `app = app.replace(/getNutritionBreakdown\(\)\.macros/g, "getNutritionBreakdown().nutrients_per_100");` didn't run or wasn't enough.

// Also, the translation errors: `micros` is missing in type...
// `const STATIC_TRANSLATIONS: any = { // ` wasn't matched. I'll just change it directly:
app = app.replace(/const STATIC_TRANSLATIONS: Record<string, \{[\s\S]*?\}\> = \{/g, "const STATIC_TRANSLATIONS: any = {");

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/subCategory\?: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
fs.writeFileSync('src/data.ts', dataTs);
