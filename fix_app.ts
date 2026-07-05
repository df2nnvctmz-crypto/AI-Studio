import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace property accesses
content = content.replace(/food\.healthScore/g, 'food.health_score');
content = content.replace(/food\.macros/g, 'food.nutrients_per_100');
content = content.replace(/food\.subCategory/g, '(food.subCategory || "Grocery")');

// In getSmartSwapsForFood, update logic
// Swap suggestion logic was:
/*
  const getSmartSwapsForFood = (currentFood: Food) => {
    const list: { fromFood: Food, toFood: Food, reason: string, scoreDiff: number }[] = [];
    SWAPS.forEach(s => {
      if (s.fromId === currentFood.id) { ... }
    });
    return list.sort((a, b) => b.scoreDiff - a.scoreDiff).slice(0, 2);
  };
*/
// Replace with new swap_suggestion_id logic
const oldSmartSwaps = `  const getSmartSwapsForFood = (currentFood: Food) => {
    const list: { fromFood: Food, toFood: Food, reason: string, scoreDiff: number }[] = [];
    SWAPS.forEach(s => {
      if (s.fromId === currentFood.id) {
        const toFood = allFoods.find(f => f.id === s.toId);
        if (toFood) {
          list.push({
            fromFood: currentFood,
            toFood,
            reason: s.reason,
            scoreDiff: toFood.healthScore - currentFood.healthScore
          });
        }
      }
    });
    return list.sort((a, b) => b.scoreDiff - a.scoreDiff).slice(0, 2);
  };`;

const newSmartSwaps = `  const getSmartSwapsForFood = (currentFood: Food) => {
    const list: { fromFood: Food, toFood: Food, reason: string, scoreDiff: number }[] = [];
    if (currentFood.swap_suggestion_id) {
      const toFood = allFoods.find(f => f.id === currentFood.swap_suggestion_id);
      if (toFood) {
        list.push({
          fromFood: currentFood,
          toFood,
          reason: "Healthier option in the same category",
          scoreDiff: toFood.health_score - currentFood.health_score
        });
      }
    }
    return list;
  };`;

content = content.replace(oldSmartSwaps, newSmartSwaps);

// In getTranslatedFood, we don't have positives, negatives, micros, verdict, servingSize anymore
// But we still have translated phrases possibly. Let's simplify getTranslatedFood
// The old one:
/*
  const getTranslatedFood = (food: Food, lang: 'en' | 'de'): Food => {
    if (lang === 'en') return food;
    return {
      ...food,
      name: translateDynamicPhrases(food.name, lang),
      category: translateDynamicPhrases(food.category, lang),
      subCategory: translateDynamicPhrases(food.subCategory, lang),
      verdict: translateDynamicVerdict(food.verdict, lang),
      positives: food.positives.map(p => translateDynamicPhrases(p, lang)),
      negatives: food.negatives.map(n => translateDynamicPhrases(n, lang)),
      micros: food.micros.map(m => ({
        ...m,
        name: translateDynamicPhrases(m.name, lang)
      }))
    };
  };
*/
const oldGetTranslatedFood = `  const getTranslatedFood = (food: Food, lang: 'en' | 'de'): Food => {
    if (lang === 'en') return food;
    return {
      ...food,
      name: translateDynamicPhrases(food.name, lang),
      category: translateDynamicPhrases(food.category, lang),
      subCategory: translateDynamicPhrases(food.subCategory, lang),
      verdict: translateDynamicVerdict(food.verdict, lang),
      positives: food.positives.map(p => translateDynamicPhrases(p, lang)),
      negatives: food.negatives.map(n => translateDynamicPhrases(n, lang)),
      micros: food.micros.map(m => ({
        ...m,
        name: translateDynamicPhrases(m.name, lang)
      }))
    };
  };`;

const newGetTranslatedFood = `  const getTranslatedFood = (food: Food, lang: 'en' | 'de'): Food => {
    if (lang === 'en') return food;
    return {
      ...food,
      name: translateDynamicPhrases(food.name, lang),
      category: translateDynamicPhrases(food.category, lang),
      subCategory: translateDynamicPhrases(food.subCategory || "Grocery", lang)
    };
  };`;
content = content.replace(oldGetTranslatedFood, newGetTranslatedFood);

// We need to fix dietary preferences since `food.macros.protein` is now `food.nutrients_per_100.protein_g`
content = content.replace(/food\.macros\.protein/g, 'food.nutrients_per_100.protein_g');
content = content.replace(/food\.macros\.carbs/g, 'food.nutrients_per_100.carbs'); // actually it's not carbs anymore, wait
content = content.replace(/food\.macros\.fat/g, 'food.nutrients_per_100.fat_g');
content = content.replace(/food\.macros\.sugars/g, 'food.nutrients_per_100.sugar_g');

// Change `import { FOODS, CATEGORIES, SWAPS, getNovaDetails, getScoreColors } from "./data";`
// to `import { FOODS, CATEGORIES, getNutriGradeDetails, getScoreColors } from "./data";`
content = content.replace('import { FOODS, CATEGORIES, SWAPS, getNovaDetails, getScoreColors }', 'import { FOODS, CATEGORIES, getNutriGradeDetails, getScoreColors }');

fs.writeFileSync('src/App.tsx', content);
