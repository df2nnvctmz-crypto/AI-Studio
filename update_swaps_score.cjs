const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./src/foods.json', 'utf8'));

// Helper to calculate similarity score (lower is better/more similar)
function calculateDistance(f1, f2) {
  const n1 = f1.nutrients_per_100;
  const n2 = f2.nutrients_per_100;
  
  let distance = 0;
  // Weight kcal difference
  distance += Math.abs((n1.kcal || 0) - (n2.kcal || 0)) * 0.1;
  
  // Weight macros
  distance += Math.abs((n1.protein_g || 0) - (n2.protein_g || 0)) * 2;
  distance += Math.abs((n1.fat_g || 0) - (n2.fat_g || 0)) * 1.5;
  distance += Math.abs((n1.fiber_g || 0) - (n2.fiber_g || 0)) * 1;
  distance += Math.abs((n1.sugar_g || 0) - (n2.sugar_g || 0)) * 0.5;

  // Name similarity bonus
  const words1 = (f1.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  const words2 = (f2.name || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
  let common = 0;
  for (const w of words1) {
    if (words2.includes(w) && w.length > 2) {
      common++;
    }
  }
  distance -= common * 15; // Stronger bonus for same words
  
  return distance;
}

data.forEach(food => {
  food.swap_suggestion_id = null;
  
  if (food.health_score < 85) {
    let bestCandidate = null;
    let minDistance = Infinity;
    
    const candidates = data.filter(c => 
      c.id !== food.id && 
      c.category === food.category && 
      c.health_score >= 65 &&
      c.health_score > food.health_score + 5
    );
    
    for (const cand of candidates) {
      const dist = calculateDistance(food, cand);
      if (dist < minDistance) {
        minDistance = dist;
        bestCandidate = cand;
      }
    }
    
    if (bestCandidate) {
      food.swap_suggestion_id = bestCandidate.id;
    }
  }
});

fs.writeFileSync('./src/foods.json', JSON.stringify(data, null, 2));
console.log('Successfully updated swap_suggestion_ids based on the new model with >= 65 limit and name similarity.');
