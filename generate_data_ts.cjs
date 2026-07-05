const https = require('https');
const fs = require('fs');

function fetchOFF(query) {
  return new Promise((resolve) => {
    https.get('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(query) + '&search_simple=1&action=process&json=1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.products.find(p => p.product_name) || null);
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function main() {
  const items = ["banana", "coca cola", "pringles", "snickers", "quaker oats", "alpro almond", "oreo"];
  let foods = [];
  for (const item of items) {
    const product = await fetchOFF(item);
    if (product) {
      let healthScore = 50;
      if (product.nutriscore_grade) {
        const scores = { a: 90, b: 75, c: 50, d: 25, e: 10 };
        healthScore = scores[product.nutriscore_grade.toLowerCase()] || 50;
      }
      
      foods.push({
        id: product._id || Math.random().toString(),
        name: product.product_name || item,
        category: "Grocery",
        subCategory: product.categories?.split(',')[0] || "Unknown",
        healthScore,
        novaGroup: product.nova_group || 3,
        servingSize: product.serving_size || "100g",
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        verdict: 'Data from Open Food Facts. Generated Nutri-Score approx ' + (product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : 'Unknown') + '. NOVA: ' + (product.nova_group || 'Unknown') + '.',
        positives: product.nova_group === 1 ? ["Minimally processed (NOVA 1)"] : [],
        negatives: product.nova_group === 4 ? ["Ultra-processed (NOVA 4)"] : [],
        macros: {
          protein: product.nutriments?.proteins_100g || 0,
          carbs: product.nutriments?.carbohydrates_100g || 0,
          fiber: product.nutriments?.fiber_100g || 0,
          sugars: product.nutriments?.sugars_100g || 0,
          fat: product.nutriments?.fat_100g || 0,
          saturatedFat: product.nutriments?.['saturated-fat_100g'] || 0,
          sodium: (product.nutriments?.sodium_100g || 0) * 1000
        },
        micros: []
      });
    }
  }
  
  const content = "export interface MacroData {\\n" +
  "  protein: number;\\n" +
  "  carbs: number;\\n" +
  "  fiber: number;\\n" +
  "  sugars: number;\\n" +
  "  fat: number;\\n" +
  "  saturatedFat: number;\\n" +
  "  sodium: number;\\n" +
  "}\\n" +
  "export interface MicroData {\\n" +
  "  name: string;\\n" +
  "  amount: string;\\n" +
  "  dvPercent: number;\\n" +
  "}\\n" +
  "export interface Food {\\n" +
  "  id: string;\\n" +
  "  name: string;\\n" +
  "  category: string;\\n" +
  "  subCategory: string;\\n" +
  "  healthScore: number;\\n" +
  "  novaGroup: number;\\n" +
  "  servingSize: string;\\n" +
  "  calories: number;\\n" +
  "  verdict: string;\\n" +
  "  positives: string[];\\n" +
  "  negatives: string[];\\n" +
  "  macros: MacroData;\\n" +
  "  micros: MicroData[];\\n" +
  "}\\n" +
  "export interface Swap {\\n" +
  "  fromId: string;\\n" +
  "  toId: string;\\n" +
  "  reason: string;\\n" +
  "}\\n" +
  "export const CATEGORIES = ['All', 'Produce', 'Dairy & Eggs', 'Pantry', 'Snacks', 'Beverages'];\\n" +
  "export const FOODS: Food[] = " + JSON.stringify(foods, null, 2) + ";\\n" +
  "export const SWAPS: Swap[] = [];\\n";

  fs.writeFileSync('src/data.ts', content);
}
main();
