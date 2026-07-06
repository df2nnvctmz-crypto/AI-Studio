const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const preferenceMatches = matchesDietaryPreference\(food, userProfile\.dietaryPreference\);\n    return categoryMatches && searchMatches && preferenceMatches;\n  \}\);/g;

const injection = `const preferenceMatches = matchesDietaryPreference(food, userProfile.dietaryPreference);
    
    // Advanced Filters (only in search tab)
    let advancedMatches = true;
    if (activeTab === "search") {
      if (searchCategory !== "All" && food.category !== searchCategory) {
        advancedMatches = false;
      }
      if (searchSubCategory !== "All" && food.subCategory !== searchSubCategory) {
        advancedMatches = false;
      }
      if (searchNutriScores.length > 0 && !searchNutriScores.includes((food.nutri_grade || 'A').toUpperCase())) {
        advancedMatches = false;
      }
      if (searchNovaScores.length > 0 && food.nova_group && !searchNovaScores.includes(food.nova_group)) {
        advancedMatches = false;
      }
      if (food.nutrients_per_100 && (food.nutrients_per_100.kcal || 0) > searchMaxCalories) {
        advancedMatches = false;
      }
    }
    
    return categoryMatches && searchMatches && preferenceMatches && advancedMatches;
  });`;

code = code.replace(regex, injection);
fs.writeFileSync('src/App.tsx', code);
