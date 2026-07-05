import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const targetOffset = circumference - (circumference * score) / 100;',
  'const validScore = isNaN(score) ? 0 : score;\n      const targetOffset = circumference - (circumference * validScore) / 100;'
);

app = app.replace(
  'const healthOffset = 264 - (264 * (avgHealthScore / 100));',
  'const validAvgHealthScore = isNaN(avgHealthScore) ? 0 : avgHealthScore;\n  const healthOffset = 264 - (264 * (validAvgHealthScore / 100));'
);

// update getReceiptScore to be more robust
const oldGetReceiptScore = `        if (df) {
          total += df.health_score;
          count++;
        }`;
const newGetReceiptScore = `        if (df && typeof df.health_score === 'number' && !isNaN(df.health_score)) {
          total += df.health_score;
          count++;
        }`;
app = app.replace(oldGetReceiptScore, newGetReceiptScore);

fs.writeFileSync('src/App.tsx', app);
