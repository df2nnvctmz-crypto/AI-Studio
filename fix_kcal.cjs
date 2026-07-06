const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/>\{spotlightFood\.nutrients_per_100\.kcal\}<\/p>/g, '>{Math.round(spotlightFood.nutrients_per_100.kcal)} kcal / 100g</p>');
code = code.replace(/>\{food\.nutrients_per_100\.kcal\} kcal/g, '>{Math.round(food.nutrients_per_100.kcal)} kcal / 100g');
code = code.replace(/\{food\.nutrients_per_100\.kcal\} kcal/g, '{Math.round(food.nutrients_per_100.kcal)} kcal / 100g');
code = code.replace(/>\{currentFoodDetail\.nutrients_per_100\.kcal\}<\/span>\n\s*<span[^>]*>kcal<\/span>/g, '>{Math.round(currentFoodDetail.nutrients_per_100.kcal)}</span>\n                      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal / 100g</span>');

fs.writeFileSync('src/App.tsx', code);
