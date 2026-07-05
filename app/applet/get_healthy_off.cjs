const https = require('https');
const fs = require('fs');

async function fetchBarcode(barcode) {
  return new Promise((resolve) => {
    https.get('https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.product || null);
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function main() {
  const barcodes = [
    "7613034947936", // Perrier Sparkling Water (Swap for Coca-Cola)
    "5011835100030", // Whole Earth Organic Peanut Butter (Swap for Nutella)
    "5010049000162", // Quaker Rolled Oats (Swap for Snickers / Sweet snack)
    "3039120150024"  // Wasa Fibres Crispbread (Swap for Sésame biscuits)
  ];
  let foods = [];
  for (const code of barcodes) {
    const product = await fetchBarcode(code);
    if (product) {
      let healthScore = 50;
      if (product.nutriscore_grade) {
        const scores = { a: 95, b: 80, c: 50, d: 25, e: 10 };
        healthScore = scores[product.nutriscore_grade.toLowerCase()] || 50;
      }
      foods.push({
        id: product._id,
        name: product.product_name,
        category: "Grocery",
        subCategory: product.categories?.split(',')[0] || "Unknown",
        healthScore,
        novaGroup: product.nova_group || 1,
        servingSize: product.serving_size || "100g",
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        verdict: 'Data from Open Food Facts. Generated Nutri-Score approx ' + (product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : 'Unknown') + '. NOVA: ' + (product.nova_group || 'Unknown') + '.',
        positives: product.nova_group === 1 ? ["Minimally processed (NOVA 1)"] : (product.nova_group === 2 ? ["Processed culinary ingredients"] : []),
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
  console.log(JSON.stringify(foods, null, 2));
}

main();
