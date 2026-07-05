import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the local getNutriGradeDetails
const funcStart = app.indexOf('// NOVA Processing Group descriptions and styles');
const funcEnd = app.indexOf('const translateCategoryName = ');
if (funcStart !== -1 && funcEnd !== -1) {
  app = app.substring(0, funcStart) + app.substring(funcEnd);
}

// 2. Add it to the imports
app = app.replace('import { FOODS, CATEGORIES } from "./data";', 'import { FOODS, CATEGORIES, getNutriGradeDetails } from "./data";');

// 3. Fix the display in the search list (it used nova.color which might not exist or be different)
app = app.replace(/{nova\.label}/g, '{nova.label}');
app = app.replace(/className={\`text-\[9px\] font-bold px-1 py-0\.2 rounded \$\{nova\.color\}\`}/g, 'className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${nova.color}`}');

fs.writeFileSync('src/App.tsx', app);
