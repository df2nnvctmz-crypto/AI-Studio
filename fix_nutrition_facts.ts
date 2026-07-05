import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. update getMacroDV
const oldMacroDV = `const getMacroDV = (macroName: string, amount: number) => {
  const standards: Record<string, number> = {
    protein: 50,      // g
    carbs: 275,       // g
    fiber: 28,        // g
    sugars: 50,       // g limit
    fat: 78,          // g
    saturatedFat: 20, // g limit
    sodium: 2300      // mg limit
  };
  const standard = standards[macroName] || 100;
  return Math.round((amount / standard) * 100);
};`;
const newMacroDV = `const getMacroDV = (macroName: string, amount: number) => {
  const standards: Record<string, number> = {
    kcal: 2000,
    protein_g: 50,
    carbs_g: 275,
    fiber_g: 28,
    sugar_g: 50,
    fat_g: 78,
    saturated_fat_g: 20,
    salt_g: 6 
  };
  const standard = standards[macroName] || 100;
  return Math.round((amount / standard) * 100);
};`;
app = app.replace(oldMacroDV, newMacroDV);

// 2. update labels in Detailed Nutrition Facts Panel
const oldLabels = `const labels: Record<string, string> = {
                          protein: language === 'en' ? "Protein" : "Eiweiß",
                          carbs: language === 'en' ? "Carbohydrates" : "Kohlenhydrate",
                          fiber: language === 'en' ? "Fiber" : "Ballaststoffe",
                          sugars: language === 'en' ? "Sugars" : "Zucker",
                          fat: language === 'en' ? "Total Fat" : "Fett",
                          saturatedFat: language === 'en' ? "Saturated Fat" : "Gesättigte Fettsäuren",
                          sodium: language === 'en' ? "Sodium" : "Natrium"
                        };`;
const newLabels = `const labels: Record<string, string> = {
                          kcal: language === 'en' ? "Calories" : "Kalorien",
                          protein_g: language === 'en' ? "Protein" : "Eiweiß",
                          carbs_g: language === 'en' ? "Carbohydrates" : "Kohlenhydrate",
                          fiber_g: language === 'en' ? "Fiber" : "Ballaststoffe",
                          sugar_g: language === 'en' ? "Sugars" : "Zucker",
                          fat_g: language === 'en' ? "Total Fat" : "Fett",
                          saturated_fat_g: language === 'en' ? "Saturated Fat" : "Gesättigte Fettsäuren",
                          salt_g: language === 'en' ? "Salt" : "Salz"
                        };`;
app = app.replace(oldLabels, newLabels);

// 3. update unit suffix
const oldUnit = `{val}{key === "sodium" ? "mg" : "g"}`;
const newUnit = `{val}{key === "kcal" ? " kcal" : "g"}`;
app = app.replace(oldUnit, newUnit);

// And we need to add a note about the percentage representing Daily Value
const oldHeader = `{language === 'en' ? 'Nutrition Facts' : 'Nährwertangaben'}
                  </h3>
                  <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#F2F6F1] dark:border-neutral-800">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                        {language === 'en' ? 'Per 100g' : 'Pro 100g'}
                      </p>`;
const newHeader = `{language === 'en' ? 'Nutrition Facts' : 'Nährwertangaben'}
                  </h3>
                  <div className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#F2F6F1] dark:border-neutral-800">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                        {language === 'en' ? 'Per 100g (% of Daily Value)' : 'Pro 100g (% des Tagesbedarfs)'}
                      </p>`;
app = app.replace(oldHeader, newHeader);

fs.writeFileSync('src/App.tsx', app);
