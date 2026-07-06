const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the spot before `return res.json(food);` and inject swap logic
const injection = `
      // Try to find a healthy swap from local DB
      let bestSwap = null;
      let minDistance = Infinity;
      if (healthScore < 85) {
        const candidates = FOODS.filter(c => c.category === computedCategory && c.health_score > healthScore + 5);
        for (const cand of candidates) {
          const n1 = food.nutrients_per_100;
          const n2 = cand.nutrients_per_100;
          let distance = 0;
          distance += Math.abs((n1.kcal || 0) - (n2.kcal || 0)) * 0.1;
          distance += Math.abs((n1.protein_g || 0) - (n2.protein_g || 0)) * 2;
          distance += Math.abs((n1.fat_g || 0) - (n2.fat_g || 0)) * 1.5;
          distance += Math.abs((n1.fiber_g || 0) - (n2.fiber_g || 0)) * 1;
          distance += Math.abs((n1.sugar_g || 0) - (n2.sugar_g || 0)) * 0.5;
          if (distance < minDistance) {
            minDistance = distance;
            bestSwap = cand;
          }
        }
      }
      if (bestSwap) {
        food.swap_suggestion_id = bestSwap.id;
      }
      
      return res.json(food);
`;

code = code.replace(/return res\.json\(food\);/g, injection);

fs.writeFileSync('server.ts', code);
