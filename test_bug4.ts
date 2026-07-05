import fs from 'fs';

const q = "avocado";

const normalizeText = (text: string | undefined): string => {
    if (!text) return "";
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").trim();
};

const allFoods = JSON.parse(fs.readFileSync('src/foods.json', 'utf8'));

const filteredFoods = allFoods.filter(food => {
      const nameMatch = normalizeText(food.name).includes(q);
      const catMatch = normalizeText(food.category).includes(q);
      const subCatMatch = normalizeText((food.subCategory || "Grocery")).includes(q);

      const originalFood = allFoods.find(f => f.id === food.id);
      let origNameMatch = false;
      let origCatMatch = false;
      let origSubCatMatch = false;

      if (originalFood) {
        origNameMatch = normalizeText(originalFood.name).includes(q);
        origCatMatch = normalizeText(originalFood.category).includes(q);
        origSubCatMatch = normalizeText(originalFood.subCategory).includes(q);
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
        if (q === key || list.includes(q) || key.includes(q)) {
           if (list.some(syn => 
               normalizeText(food.name).includes(syn) || 
               normalizeText(food.category).includes(syn) ||
              normalizeText((food.subCategory || "Grocery")).includes(syn) ||
              (originalFood && (
                normalizeText(originalFood.name).includes(syn) ||
                normalizeText(originalFood.category).includes(syn) ||
                normalizeText(originalFood.subCategory).includes(syn)
              ))
           )) {
             synonymMatch = true;
             break;
           }
        }
      }

      const searchMatches = nameMatch || catMatch || subCatMatch || origNameMatch || origCatMatch || origSubCatMatch || synonymMatch;
      return searchMatches;
});

console.log(filteredFoods.map(f => f.name));
