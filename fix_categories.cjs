const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/foods.json', 'utf8'));

const mapCategory = (cat) => {
  if (cat === 'Sweets & chocolate' || cat === 'Fast food style' || cat === 'Snacks') return 'Snacks';
  if (cat === 'Fruits & vegetables') return 'Produce';
  if (cat === 'Dairy & yogurt') return 'Dairy & Eggs';
  if (cat === 'Beverages') return 'Beverages';
  // Bread, pasta, frozen, spreads, deli, cereals, legumes...
  return 'Pantry';
};

data.forEach(food => {
  food.category = mapCategory(food.category);
});

fs.writeFileSync('./src/foods.json', JSON.stringify(data, null, 2));
