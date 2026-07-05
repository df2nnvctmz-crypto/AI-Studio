const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const zucchini = {
  "id": "gourmet_zucchini",
  "name": "Gourmet Zucchini",
  "category": "Produce",
  "subCategory": "Vegetables",
  "healthScore": 95,
  "novaGroup": 1,
  "servingSize": "100g",
  "calories": 180,
  "verdict": "Data from Open Food Facts. Generated Nutri-Score approx A. NOVA: 1.",
  "positives": [
    "Minimally processed (NOVA 1)",
    "No added sugars"
  ],
  "negatives": [],
  "macros": {
    "protein": 11,
    "carbs": 19,
    "fiber": 2,
    "sugars": 28,
    "fat": 28,
    "saturatedFat": 8,
    "sodium": 365
  },
  "micros": []
};

code = code.replace(
  'export const FOODS: Food[] = [',
  'export const FOODS: Food[] = [\n  ' + JSON.stringify(zucchini, null, 2) + ','
);

fs.writeFileSync('src/data.ts', code);
