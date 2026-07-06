const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newPopularSearches = `const popularSearches = language === 'en'
    ? ["Dairy", "Produce", "Snacks", "Beverages", "Pantry"]
    : ["Milchprodukte", "Frischeprodukte", "Snacks", "Getränke", "Vorratskammer"];`;

code = code.replace(/const popularSearches = language === 'en'[\s\S]*?: \["Avocado", "Joghurt", "Haferflocken", "Spinat", "Blaubeeren", "Äpfel"\];/g, newPopularSearches);

const oldSearchMatch = `searchMatches = nameMatch || origNameMatch || synonymMatch;`;
const newSearchMatch = `const translatedCat = translateCategoryName(food.category, language);
      const catMatch = normalizeText(food.category).includes(q) || 
                       normalizeText(translatedCat).includes(q) || 
                       (food.subCategory && normalizeText(food.subCategory).includes(q));
      
      // Specifically map "Dairy" to "Dairy & Eggs"
      let customCatMatch = false;
      if (q.includes("dairy") || q.includes("milch")) {
         customCatMatch = food.category === "Dairy & Eggs";
      }

      searchMatches = nameMatch || origNameMatch || synonymMatch || catMatch || customCatMatch;`;

code = code.replace(oldSearchMatch, newSearchMatch);

fs.writeFileSync('src/App.tsx', code);
