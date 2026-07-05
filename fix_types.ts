import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');

// Replace everything above ReceiptItem with import { Food } from './data';
content = `import { Food } from './data';\n\n` + content.substring(content.indexOf('export interface ReceiptItem'));

fs.writeFileSync('src/types.ts', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(/import \{ FOODS, CATEGORIES, SWAPS, getNovaDetails, getScoreColors \} from "\.\/data";/, 'import { FOODS, CATEGORIES, getNutriGradeDetails, getScoreColors } from "./data";');
// if the previous replace didn't work because of spacing or newlines
appContent = appContent.replace(/SWAPS,\s*/g, '');
appContent = appContent.replace(/getNovaDetails,\s*/g, '');

// Also let's find other references to novaGroup, positives, negatives, micros, verdict, servingSize, macros
appContent = appContent.replace(/currentFoodDetail\.macros/g, 'currentFoodDetail.nutrients_per_100');
appContent = appContent.replace(/currentFoodDetail\.healthScore/g, 'currentFoodDetail.health_score');
appContent = appContent.replace(/spotlightFood\.macros/g, 'spotlightFood.nutrients_per_100');

// Nova details:
appContent = appContent.replace(/const nova = getNovaDetails\(food\.novaGroup\);/g, 'const nova = getNutriGradeDetails(food.nutri_grade);');
appContent = appContent.replace(/NOVA \{spotlightFood\.novaGroup\}/g, '{getNutriGradeDetails(spotlightFood.nutri_grade).label}');
appContent = appContent.replace(/NOVA \{currentFoodDetail\.novaGroup\}/g, '{getNutriGradeDetails(currentFoodDetail.nutri_grade).label}');
appContent = appContent.replace(/const nova = getNovaDetails\(currentFoodDetail\.novaGroup\);/g, 'const nova = getNutriGradeDetails(currentFoodDetail.nutri_grade);');
appContent = appContent.replace(/getNovaDetails/g, 'getNutriGradeDetails');

// Fix macros map:
// Object.keys(fromFood.macros).map(...) -> Object.keys(fromFood.nutrients_per_100)
appContent = appContent.replace(/fromFood\.macros/g, 'fromFood.nutrients_per_100');
appContent = appContent.replace(/toFood\.macros/g, 'toFood.nutrients_per_100');

// Fix the serving size texts
appContent = appContent.replace(/\{language === 'en' \? \`Per serving · \$\{currentFoodDetail\.servingSize\}\` : \`Pro Portion · \$\{currentFoodDetail\.servingSize\}\`\}/g, "{language === 'en' ? 'Per 100g' : 'Pro 100g'}");
appContent = appContent.replace(/\{spotlightFood\.servingSize \|\| "100g"\}/g, '"100g"');
appContent = appContent.replace(/\{currentFoodDetail\.servingSize\}/g, '"100g"');

// Fix nutrition breakdown in App.tsx
appContent = appContent.replace(/currentFoodDetail\.positives\.map/g, '(currentFoodDetail as any).positives?.map');
appContent = appContent.replace(/currentFoodDetail\.negatives\.length/g, '((currentFoodDetail as any).negatives?.length || 0)');
appContent = appContent.replace(/currentFoodDetail\.negatives\.map/g, '(currentFoodDetail as any).negatives?.map');
appContent = appContent.replace(/currentFoodDetail\.verdict/g, '(currentFoodDetail as any).verdict');

fs.writeFileSync('src/App.tsx', appContent);
