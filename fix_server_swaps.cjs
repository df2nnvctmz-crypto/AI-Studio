const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Try to find a healthy swap from local DB[\s\S]*?return res\.json\(food\);/;

const injection = `// Try to find a healthy swap from local DB
      let bestSwap = null;
      let minDistance = Infinity;
      if (healthScore < 85) {
        const candidates = FOODS.filter(c => c.category === computedCategory && c.health_score > healthScore + 5 && c.health_score >= 65);
        for (const cand of candidates) {
          const n1 = food.nutrients_per_100;
          const n2 = cand.nutrients_per_100;
          let distance = 0;
          distance += Math.abs((n1.kcal || 0) - (n2.kcal || 0)) * 0.1;
          distance += Math.abs((n1.protein_g || 0) - (n2.protein_g || 0)) * 2;
          distance += Math.abs((n1.fat_g || 0) - (n2.fat_g || 0)) * 1.5;
          distance += Math.abs((n1.fiber_g || 0) - (n2.fiber_g || 0)) * 1;
          distance += Math.abs((n1.sugar_g || 0) - (n2.sugar_g || 0)) * 0.5;
          
          const words1 = (food.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          const words2 = (cand.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
          let common = 0;
          for (const w of words1) {
            if (words2.includes(w) && w.length > 2) {
              common++;
            }
          }
          distance -= common * 15;
          
          if (distance < minDistance) {
            minDistance = distance;
            bestSwap = cand;
          }
        }
      }
      if (bestSwap) {
        food.swap_suggestion_id = bestSwap.id;
      }
      
      return res.json(food);`;

code = code.replace(regex, injection);
fs.writeFileSync('server.ts', code);
