import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Fix translation types in STATIC_TRANSLATIONS
app = app.replace(/micros: \[\s*\{[\s\S]*?\}\s*\]/g, "");

// Fix novaGroup in MOCK_RECEIPTS
app = app.replace(/novaGroup: \d+,/g, "nutri_grade: 'A', swap_suggestion_id: null,");

// Fix App.tsx 3457 and 3488 - this is getNutritionBreakdown().macros -> getNutritionBreakdown().nutrients_per_100
// Wait, getNutritionBreakdown() returns { calories, macros: [...] }. Ah! My regex replaced `macros:` with `nutrients_per_100:`!
// Let's change getNutritionBreakdown return type back or fix the usage
app = app.replace(/getNutritionBreakdown\(\)\.macros/g, "getNutritionBreakdown().nutrients_per_100");
app = app.replace(/getNutritionBreakdown\(\)\.micros/g, "getNutritionBreakdown().micros");

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/subCategory\?: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
fs.writeFileSync('src/data.ts', dataTs);
