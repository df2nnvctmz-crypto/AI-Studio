import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/calories: \d+,/g, "");

// find STATIC_TRANSLATIONS entirely and remove it or replace with an empty object of any
// It looks like `const STATIC_TRANSLATIONS: any = { ... };` or `const STATIC_TRANSLATIONS = { ... };`
// Instead of matching it, I'll just change the type of `getTranslatedFood` to not use it, wait I already did.
// Let's just `any` all the translations by adding an any cast?
// Or we can just use sed/awk to find the block. Let's just match `const STATIC_TRANSLATIONS = {` to the end of the object. But wait, I'll just remove the whole translation file from App.tsx. It's too big.
// Better: just delete lines 208 to around 473.
const lines = app.split('\n');
const start = lines.findIndex(l => l.includes('const STATIC_TRANSLATIONS'));
if (start !== -1) {
    let end = start;
    let braces = 0;
    for (let i = start; i < lines.length; i++) {
        if (lines[i].includes('{')) braces += (lines[i].match(/\{/g) || []).length;
        if (lines[i].includes('}')) braces -= (lines[i].match(/\}/g) || []).length;
        if (braces === 0 && i > start) {
            end = i;
            break;
        }
    }
    lines.splice(start, end - start + 1);
    app = lines.join('\n');
}

// Remove the getTranslatedFood function because I can just use it directly, wait no I need it for the name.
// But earlier I had:
/*
const getTranslatedFood = (food: Food, lang: "en" | "de"): Food => {
  if (lang === "en") return food;
  return {
    ...food,
    name: translateDynamicName(food.name, lang),
    category: translateCategoryName(food.category, lang),
    subCategory: translateSubcategoryName((food.subCategory || "Grocery"), lang)
  };
};
*/
// That is fine.

fs.writeFileSync('src/App.tsx', app);

let dataTs = fs.readFileSync('src/data.ts', 'utf8');
dataTs = dataTs.replace(/subCategory\?: string;\n  subCategory\?: string;/g, 'subCategory?: string;');
dataTs = dataTs.replace(/subCategory: string;/g, 'subCategory?: string;'); // in case it was subCategory: string;
fs.writeFileSync('src/data.ts', dataTs);

