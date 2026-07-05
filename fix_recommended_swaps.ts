import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const getSmartSwapsForFood = \([^\)]+\)[^\{]*\{[\s\S]*?return swaps;\s*\};/;

const newLogic = `const getSmartSwapsForFood = (food: typeof allFoods[0]) => {
  if (!food.swap_suggestion_id) return [];
  const swapFood = allFoods.find(f => f.id === food.swap_suggestion_id);
  if (!swapFood) return [];
  return [{
    fromId: food.id,
    toId: swapFood.id
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
  console.log("Replaced!");
} else {
  console.log("Not found regex for getSmartSwapsForFood");
}

