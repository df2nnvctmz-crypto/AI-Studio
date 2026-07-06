const fs = require('fs');

const csv = fs.readFileSync('swiss_foods_clean.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);
const headers = lines[0].split(',');

const parseNumber = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const mapCategory = (cat) => {
  const c = cat.toLowerCase();
  if (c.includes('vegetable') || c.includes('fruit') || c.includes('herb') || c.includes('mushroom') || c.includes('sprout')) return 'Produce';
  if (c.includes('milk') || c.includes('dairy') || c.includes('cheese') || c.includes('egg') || c.includes('yogurt') || c.includes('butter') || c.includes('cream')) return 'Dairy & Eggs';
  if (c.includes('beverage') || c.includes('drink') || c.includes('juice') || c.includes('wine') || c.includes('beer') || c.includes('coffee') || c.includes('tea') || c.includes('water')) return 'Beverages';
  if (c.includes('sweet') || c.includes('snack') || c.includes('cake') || c.includes('biscuit') || c.includes('cookie') || c.includes('chocolate') || c.includes('candy') || c.includes('ice cream') || c.includes('chip')) return 'Snacks';
  return 'Pantry';
};

const parseLine = (line) => {
  // Simple CSV parser for quoted fields
  const result = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const items = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseLine(lines[i]);
  const data = {};
  headers.forEach((h, idx) => {
    data[h] = row[idx];
  });

  const sodium_mg = parseNumber(data['sodium_mg']);
  const salt_g = sodium_mg !== null ? Math.round((sodium_mg * 2.5) / 1000 * 100) / 100 : 0;
  
  const sugars_g = parseNumber(data['sugars_g']) || 0;
  const fat_sat_g = parseNumber(data['fat_sat_g']) || 0;
  const fiber_g = parseNumber(data['fiber_g']) || 0;
  const protein_g = parseNumber(data['protein_g']) || 0;
  
  const sodium_for_score = sodium_mg !== null ? sodium_mg : 0;
  
  let score = 75 - (sugars_g * 1.0) - (fat_sat_g * 1.5) - ((sodium_for_score / 1000) * 12) + (fiber_g * 2.5) + (protein_g * 1.2);
  score = Math.max(5, Math.min(100, score));
  score = Math.round(score);

  let nutri_grade = 'E';
  if (score >= 80) nutri_grade = 'A';
  else if (score >= 65) nutri_grade = 'B';
  else if (score >= 48) nutri_grade = 'C';
  else if (score >= 35) nutri_grade = 'D';

  const item = {
    id: data['id'],
    name: data['name'],
    category: mapCategory(data['category']),
    swiss_category: data['category'],
    health_score: score,
    nutri_grade: nutri_grade,
    swap_suggestion_id: null,
    nutrients_per_100: {
      kcal: parseNumber(data['energy_kcal']) || 0,
      protein_g: protein_g,
      carbs_g: parseNumber(data['carbs_g']) || 0,
      sugars_g: sugars_g,
      fat_g: parseNumber(data['fat_g']) || 0,
      saturated_fat_g: fat_sat_g,
      fiber_g: fiber_g,
      salt_g: salt_g,
      micros: {
        vitamin_a_ug: parseNumber(data['vitamin_a_activity_ug']),
        betacarotene_ug: parseNumber(data['betacarotene_ug']),
        vitamin_b1_mg: parseNumber(data['vitamin_b1_mg']),
        vitamin_b2_mg: parseNumber(data['vitamin_b2_mg']),
        vitamin_b6_mg: parseNumber(data['vitamin_b6_mg']),
        vitamin_b12_ug: parseNumber(data['vitamin_b12_ug']),
        niacin_mg: parseNumber(data['niacin_mg']),
        folate_ug: parseNumber(data['folate_ug']),
        pantothenic_acid_mg: parseNumber(data['pantothenic_acid_mg']),
        vitamin_c_mg: parseNumber(data['vitamin_c_mg']),
        vitamin_d_ug: parseNumber(data['vitamin_d_ug']),
        vitamin_e_mg: parseNumber(data['vitamin_e_mg']),
        sodium_mg: sodium_mg,
        potassium_mg: parseNumber(data['potassium_mg']),
        chloride_mg: parseNumber(data['chloride_mg']),
        calcium_mg: parseNumber(data['calcium_mg']),
        magnesium_mg: parseNumber(data['magnesium_mg']),
        phosphorus_mg: parseNumber(data['phosphorus_mg']),
        iron_mg: parseNumber(data['iron_mg']),
        iodide_ug: parseNumber(data['iodide_ug']),
        zinc_mg: parseNumber(data['zinc_mg'])
      }
    }
  };
  items.push(item);
}

fs.writeFileSync('src/foods.json', JSON.stringify(items, null, 2));
console.log(`Parsed ${items.length} items to src/foods.json`);
