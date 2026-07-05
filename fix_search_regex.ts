import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

// I want to replace the whole `if (query) { ... }` block
const startIndex = app.indexOf('if (query) {');
const endIndex = app.indexOf('const preferenceMatches = ', startIndex);

const newLogic = `if (query) {
      const q = query.trim();
      const nameMatch = normalizeText(food.name).includes(q);
      
      const originalFood = allFoods.find(f => f.id === food.id);
      let origNameMatch = false;
      if (originalFood) {
        origNameMatch = normalizeText(originalFood.name).includes(q);
      }
      
      let synonymMatch = false;
      const synonyms: Record<string, string[]> = {
        avocado: ["avocados", "avocado", "hass_avocado"],
        joghurt: ["yogurt", "joghurt", "yoghurt", "griechischer naturjoghurt", "naturjoghurt"],
        yogurt: ["joghurt", "yogurt", "yoghurt", "greek yogurt"],
        haferflocken: ["oats", "haferflocken", "rolled oats", "breakfast cereals"],
        oats: ["haferflocken", "oats"],
        spinat: ["spinach", "spinat", "baby spinach"],
        spinach: ["spinat", "spinach", "baby spinach"],
        blaubeeren: ["blueberries", "blaubeeren", "berry", "berries", "blueberry"],
        blueberries: ["blaubeeren", "blueberries", "blueberry", "berry", "berries"],
        apfel: ["apples", "apfel", "apple"],
        apples: ["apfel", "apples", "apple"],
        apple: ["apfel", "apple", "apples"],
        wasser: ["water", "wasser", "sidi ali"],
        water: ["wasser", "water", "sidi ali"],
        zucchini: ["zucchini", "vegetables", "gemuse", "courgette"],
        eier: ["eggs", "eier", "egg", "ei"],
        eggs: ["eier", "eggs", "egg", "ei"],
        erdnussbutter: ["peanut butter", "erdnussbutter", "peanut", "erdnuss"],
        peanut: ["erdnussbutter", "peanut", "peanut butter"]
      };
      
      for (const [key, list] of Object.entries(synonyms)) {
        if (q === key || list.includes(q)) {
           if (list.some(syn => 
               normalizeText(food.name).includes(syn) || 
              (originalFood && normalizeText(originalFood.name).includes(syn))
           )) {
             synonymMatch = true;
             break;
           }
        }
      }
      
      searchMatches = nameMatch || origNameMatch || synonymMatch;
    }
    
    `;

app = app.substring(0, startIndex) + newLogic + app.substring(endIndex);

fs.writeFileSync('src/App.tsx', app);

