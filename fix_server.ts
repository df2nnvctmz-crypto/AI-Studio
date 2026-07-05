import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const food = \{\s*id: id \|\| offData\.id \|\| productCode,[\s\S]*?offUrl\s*\};/g, `const food = {
        id: id || offData.id || productCode,
        name: foodName,
        category: computedCategory,
        subCategory: offData.categories?.split(',')[0]?.trim() || "General",
        health_score: healthScore,
        nutri_grade: offData.nutriscore_grade?.toUpperCase() || 'A',
        swap_suggestion_id: null,
        offUrl,
        nutrients_per_100: {
          protein_g: Number((offData.nutriments?.proteins_100g || 0).toFixed(1)),
          fiber_g: Number((offData.nutriments?.fiber_100g || 0).toFixed(1)),
          sugar_g: Number((offData.nutriments?.sugars_100g || 0).toFixed(1)),
          fat_g: Number((offData.nutriments?.fat_100g || 0).toFixed(1)),
          saturated_fat_g: Number((offData.nutriments?.['saturated-fat_100g'] || 0).toFixed(1)),
          salt_g: Number((offData.nutriments?.sodium_100g || 0)) * 2.5, // approximate salt
          kcal: Math.round(offData.nutriments?.['energy-kcal_100g'] || offData.nutriments?.['energy-kcal'] || 100)
        }
      };`);

code = code.replace(/return \{\s*id,[\s\S]*?micros\s*\};/g, `return {
    id,
    name,
    category,
    subCategory,
    health_score: healthScore,
    nutri_grade: novaGroup <= 2 ? 'A' : (novaGroup === 3 ? 'C' : 'E'),
    swap_suggestion_id: null,
    nutrients_per_100: {
      kcal: calories,
      protein_g: protein,
      fiber_g: fiber,
      sugar_g: sugars,
      fat_g: fat,
      saturated_fat_g: saturatedFat,
      salt_g: sodium * 2.5 / 1000
    }
  };`);

fs.writeFileSync('server.ts', code);
