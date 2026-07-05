import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const getSmartSwapsForFood = \(currentFood: Food\) => \{[\s\S]*?return list;\n  \};/;

const newLogic = `const getSmartSwapsForFood = (currentFood: Food) => {
    const list: { fromFood: Food, toFood: Food, reason: string, scoreDiff: number }[] = [];
    if (currentFood.swap_suggestion_id) {
      const toF = allFoods.find(f => f.id === currentFood.swap_suggestion_id);
      if (toF) {
        list.push({
          fromFood: currentFood,
          toFood: toF,
          reason: "Healthier option in the same category",
          scoreDiff: toF.health_score - currentFood.health_score
        });
      }
    }
    return list;
  };`;

app = app.replace(regex, newLogic);

fs.writeFileSync('src/App.tsx', app);

