import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const getSmartSwapsForFood = \(currentFood: Food\) => \{[\s\S]*?return list\.slice\(0, 2\);\n  \};/;

const newLogic = `const getSmartSwapsForFood = (currentFood: Food) => {
    if (!currentFood.swap_suggestion_id) return [];
    const swapFood = allFoods.find(f => f.id === currentFood.swap_suggestion_id);
    if (!swapFood) return [];
    return [{
      fromFood: currentFood,
      toFood: swapFood,
      reason: language === 'en' ? 'Better nutritional profile' : 'Besseres Nährwertprofil',
      scoreDiff: swapFood.health_score - currentFood.health_score
    }];
  };

  const recommendedSwaps = useMemo(() => {
    const validSwaps: { fromId: string, toId: string }[] = [];
    allFoods.forEach(food => {
      if (food.swap_suggestion_id) {
        const swapFood = allFoods.find(f => f.id === food.swap_suggestion_id);
        if (swapFood) {
          validSwaps.push({ fromId: food.id, toId: swapFood.id });
        }
      }
    });
    return validSwaps;
  }, []);`;

if (regex.test(code)) {
  code = code.replace(regex, newLogic);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced");
} else {
  console.log("Regex not found");
}

