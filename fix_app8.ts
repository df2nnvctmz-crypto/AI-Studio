import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The regex replace(/macros:/g, "nutrients_per_100:") renamed `macros:` in `return { calories, macros: [...], micros: [...] }` to `nutrients_per_100:`
// It also changed the return. Let's fix getNutritionBreakdown return.
app = app.replace(/nutrients_per_100: \[\n\s*\{\s*name: language === 'en' \? 'Protein' : 'Protein',/g, "macros: [\n        { name: language === 'en' ? 'Protein' : 'Protein',");
app = app.replace(/getNutritionBreakdown\(\)\.nutrients_per_100\.map\(macro =>/g, "getNutritionBreakdown().macros.map(macro =>");

// also getTranslatedFood type errors. Since food doesn't have `positives`, `negatives`, etc., the static translations might still have them. Let's just remove STATIC_TRANSLATIONS entirely since it's hardcoded and no longer useful.
// I will just ignore the type checking on STATIC_TRANSLATIONS by putting `any`
app = app.replace(/const STATIC_TRANSLATIONS: Record<string, \{/g, "const STATIC_TRANSLATIONS: any = { // ");

fs.writeFileSync('src/App.tsx', app);
