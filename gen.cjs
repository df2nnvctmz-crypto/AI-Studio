const fs = require('fs');

const items = [];
const categories = ["Produce", "Pantry", "Dairy", "Bakery", "Snacks", "Beverages", "Meat"];
const names = [
  "Burger", "Greek Salad", "Zucchini", "Paprika", "Pizza", "Apple", "Banana", "Tomato",
  "Cucumber", "Lettuce", "Carrot", "Broccoli", "Chicken Breast", "Beef Steak", "Pork Chop",
  "Salmon Fillet", "Tuna Can", "Milk", "Cheese", "Yogurt", "Butter", "Bread", "Croissant",
  "Bagel", "Muffin", "Chips", "Popcorn", "Pretzels", "Cookies", "Chocolate", "Water",
  "Soda", "Juice", "Coffee", "Tea"
];
// We need ~500 items, let's combine adjectives to create unique items
const adjectives = ["Organic", "Fresh", "Spicy", "Sweet", "Salty", "Crispy", "Tender", "Roasted", "Smoked", "Grilled", "Vegan", "Gluten-Free", "Low-Fat", "Premium", "Classic", "Artisan"];

for (let i = 0; i < 500; i++) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const nameBase = names[Math.floor(Math.random() * names.length)];
  const name = `${adj} ${nameBase}`;
  const category = categories[Math.floor(Math.random() * categories.length)];
  const healthScore = Math.floor(Math.random() * 80) + 20; // 20 to 99
  const novaGroup = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const calories = Math.floor(Math.random() * 400) + 50; // 50 to 450
  
  items.push(`  {
    id: "gen_${i}",
    name: "${name}",
    category: "${category}",
    subCategory: "General",
    healthScore: ${healthScore},
    novaGroup: ${novaGroup},
    servingSize: "100g",
    calories: ${calories},
    verdict: "Automatically generated food item.",
    positives: ["Source of energy"],
    negatives: ["May contain allergens"],
    macros: { protein: ${Math.floor(Math.random()*20)}, carbs: ${Math.floor(Math.random()*40)}, fiber: ${Math.floor(Math.random()*10)}, sugars: ${Math.floor(Math.random()*20)}, fat: ${Math.floor(Math.random()*20)}, saturatedFat: ${Math.floor(Math.random()*5)}, sodium: ${Math.floor(Math.random()*500)} },
    micros: []
  }`);
}

const fileContent = `import { Food } from "./types";

export const MORE_FOODS: Food[] = [
${items.join(",\n")}
];
`;

fs.writeFileSync('src/dataExtra.ts', fileContent);
console.log('Created dataExtra.ts');
