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
  
  return distance;
}

data.forEach(food => {
  // Clear the existing swap suggestion first
  food.swap_suggestion_id = null;
  
  // Only suggest swaps if the food could be improved
  // E.g., health_score < 85
  if (food.health_score < 85) {
    let bestCandidate = null;
    let minDistance = Infinity;
    
    // Look for a healthier option in the same category
    const candidates = data.filter(c => 
      c.id !== food.id && 
      c.category === food.category && 
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
console.log('Successfully updated swap_suggestion_ids based on the new model.');
