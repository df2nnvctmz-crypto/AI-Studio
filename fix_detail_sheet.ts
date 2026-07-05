import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexDupe = /<div className="flex items-baseline gap-1 pt-1">\s*<span className="text-2xl font-bold text-\[\#519D46\] dark:text-emerald-400">\{currentFoodDetail\.nutrients_per_100\.kcal\}<\/span>\s*<span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal<\/span>\s*<\/div>\s*<\/div>\s*<div className="flex items-baseline gap-1 pt-1">\s*<span className="text-2xl font-bold text-\[\#519D46\] dark:text-emerald-400">\{currentFoodDetail\.nutrients_per_100\.kcal\}<\/span>\s*<span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal<\/span>\s*<\/div>/g;

code = code.replace(regexDupe, `<div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-bold text-[#519D46] dark:text-emerald-400">{currentFoodDetail.nutrients_per_100.kcal}</span>
                      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal</span>
                    </div>`);

// Also fix "Calories" label to say "kcal" in the macros? The user's screenshot had 42 Calories but the label should probably be just Calories or kcal. Let's leave that for now.

fs.writeFileSync('src/App.tsx', code);
