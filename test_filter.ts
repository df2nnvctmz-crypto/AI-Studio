import fs from 'fs';
const app = fs.readFileSync('src/App.tsx', 'utf8');

// just write a tiny script to test the logic
const data = JSON.parse(fs.readFileSync('src/foods.json', 'utf8'));
const q = "avocado";
const normalizeText = (text: string | undefined): string => {
    if (!text) return "";
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").trim();
};

const synonyms: Record<string, string[]> = {
    avocado: ["avocados", "avocado", "hass_avocado"],
    joghurt: ["yogurt", "joghurt", "yoghurt", "griechischer naturjoghurt", "naturjoghurt"],
    // ...
};

const matches = data.filter(food => {
      const nameMatch = normalizeText(food.name).includes(q);
      const catMatch = normalizeText(food.category).includes(q);
      const subCatMatch = normalizeText((food.subCategory || "Grocery")).includes(q);

      let synonymMatch = false;
      for (const [key, list] of Object.entries(synonyms)) {
        if (q === key || list.includes(q) || key.includes(q)) {
           if (list.some(syn => 
               normalizeText(food.name).includes(syn) || 
               normalizeText(food.category).includes(syn) ||
              normalizeText((food.subCategory || "Grocery")).includes(syn) 
           )) {
             synonymMatch = true;
             break;
           }
        }
      }
      return nameMatch || catMatch || subCatMatch || synonymMatch;
});
console.log(matches.map(m => m.name));
