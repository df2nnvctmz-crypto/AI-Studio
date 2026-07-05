import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// I will use regex to replace getTranslatedFood entirely.
const regex = /const getTranslatedFood = \(food: Food, lang: "en" \| "de"\): Food => \{[\s\S]*?return \{\s*\.\.\.food,[\s\S]*?\};\s*\};/;
const replacement = `const getTranslatedFood = (food: Food, lang: "en" | "de"): Food => {
  if (lang === "en") return food;
  return {
    ...food,
    name: translateDynamicName(food.name, lang),
    category: translateCategoryName(food.category, lang),
    subCategory: translateSubcategoryName((food.subCategory || "Grocery"), lang)
  };
};`;

app = app.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', app);
