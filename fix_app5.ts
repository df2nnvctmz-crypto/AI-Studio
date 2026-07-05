import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The type ReceiptItem in types.ts is:
// export interface ReceiptItem { id: string; cleanName: string; foodData?: Food; }
// So in MOCK_RECEIPTS, we can just use the items from FOODS.
app = app.replace(/novaGroup: \d+,/g, "nutri_grade: 'A', swap_suggestion_id: null,");
app = app.replace(/servingSize: "[^"]*",/g, "");
app = app.replace(/calories: \d+,/g, "");
app = app.replace(/verdict: "[^"]*",/g, "");
app = app.replace(/positives: \[[^\]]*\],/g, "");
app = app.replace(/negatives: \[[^\]]*\],/g, "");
app = app.replace(/macros:/g, "nutrients_per_100:");
app = app.replace(/micros: \[[^\]]*\]/g, "");

// also rename macros keys to match nutrients_per_100
app = app.replace(/protein: ([\d.]+), carbs: ([\d.]+), fiber: ([\d.]+), sugars: ([\d.]+), fat: ([\d.]+), saturatedFat: ([\d.]+), sodium: ([\d.]+)/g, 'protein_g: $1, carbs_g: $2, fiber_g: $3, sugar_g: $4, fat_g: $5, saturated_fat_g: $6, salt_g: $7, kcal: 100');

// "carbs_g" is not in Nutrients interface! It's not there, wait, did I remove carbs entirely?
// Let's check what Nutrients interface has: kcal, sugar_g, fat_g, saturated_fat_g, salt_g, fiber_g, protein_g
// Ah! No carbs! It's okay, we can just omit carbs or add it back to types if App.tsx uses it. Wait, App.tsx used `food.nutrients_per_100.carbs`? Let's check `App.tsx`.
