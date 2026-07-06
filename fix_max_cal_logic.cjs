const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/if \(food\.nutrients_per_100 && \(food\.nutrients_per_100\.kcal \|\| 0\) > searchMaxCalories\) \{/g, 'if (searchMaxCalories < 1000 && food.nutrients_per_100 && (food.nutrients_per_100.kcal || 0) > searchMaxCalories) {');

fs.writeFileSync('src/App.tsx', code);
