const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const injection = `const popularSearches = language === 'en'
    ? ["Dairy", "Produce", "Snacks", "Beverages", "Pantry"]
    : ["Milchprodukte", "Frischeprodukte", "Snacks", "Getränke", "Vorratskammer"];
    
  const availableSubCategories = Array.from(new Set(allFoods.map(f => f.subCategory).filter(Boolean))) as string[];`;

code = code.replace(/const popularSearches = language === 'en'\n    \? \["Dairy", "Produce", "Snacks", "Beverages", "Pantry"\]\n    : \["Milchprodukte", "Frischeprodukte", "Snacks", "Getränke", "Vorratskammer"\];/g, injection);

fs.writeFileSync('src/App.tsx', code);
