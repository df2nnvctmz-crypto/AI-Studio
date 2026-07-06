const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/scoreDiff: swapFood\.health_score - currentFood\.health_score/g, 'scoreDiff: Math.round(swapFood.health_score - currentFood.health_score)');
code = code.replace(/const scoreDiff = toFood\.health_score - fromFood\.health_score;/g, 'const scoreDiff = Math.round(toFood.health_score - fromFood.health_score);');

code = code.replace(/\/100 \{fromFood\.calories\} kcal/g, '{Math.round(fromFood.nutrients_per_100?.kcal || 0)} kcal / 100g');
code = code.replace(/\/100 \{toFood\.calories\} kcal/g, '{Math.round(toFood.nutrients_per_100?.kcal || 0)} kcal / 100g');

code = code.replace(/isBetterNutrient\("calories", fromFood\.calories, toFood\.calories\)/g, 'isBetterNutrient("kcal", fromFood.nutrients_per_100?.kcal || 0, toFood.nutrients_per_100?.kcal || 0)');
code = code.replace(/\{fromFood\.calories\}/g, '{Math.round(fromFood.nutrients_per_100?.kcal || 0)}');
code = code.replace(/\{toFood\.calories\}/g, '{Math.round(toFood.nutrients_per_100?.kcal || 0)}');

code = code.replace(/\(fromFood\.calories \/ 300\)/g, '((fromFood.nutrients_per_100?.kcal || 0) / 300)');
code = code.replace(/\(toFood\.calories \/ 300\)/g, '((toFood.nutrients_per_100?.kcal || 0) / 300)');

fs.writeFileSync('src/App.tsx', code);
