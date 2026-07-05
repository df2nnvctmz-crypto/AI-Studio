import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. change "100g" to "per 100g"
app = app.replace(/"100g"/g, 'per 100g'); // will verify this replaces in right spot

// 2. change currentFoodDetail.calories to currentFoodDetail.nutrients_per_100.kcal
app = app.replace(/{currentFoodDetail\.calories}/g, '{currentFoodDetail.nutrients_per_100.kcal}');

// 3. remove NOVA tag section
const novaRegex = /\{\/\*\s*NOVA Tag\s*\*\/\}\s*<div className="pt-2 pb-1 space-y-1\.5">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex-shrink-0 -mt-2">/;
app = app.replace(novaRegex, '</div>\n\n<div className="flex-shrink-0 -mt-2">');

// 4. remove Verdict Section
const verdictRegex = /\{\/\*\s*Verdict Section\s*\*\/\}\s*<div className="bg-\[#EAF3EB\][\s\S]*?<\/div>/;
app = app.replace(verdictRegex, '');

// 5. remove Benefits List
const benefitsRegex = /\{\/\*\s*Benefits List\s*\*\/\}\s*<div className="space-y-3 text-left">[\s\S]*?<\/ul>\s*<\/div>/;
app = app.replace(benefitsRegex, '');

// 6. remove Watch Out List
const watchOutRegex = /\{\/\*\s*Watch Out List\s*\*\/\}\s*\{[\s\S]*?\}\)/;
app = app.replace(watchOutRegex, '');

fs.writeFileSync('src/App.tsx', app);
