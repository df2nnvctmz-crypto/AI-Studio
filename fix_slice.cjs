const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{foodsMatchingPreference\.filter\(f => f\.health_score > 75\)\.map\(\(food\)/g, '{foodsMatchingPreference.filter(f => f.health_score > 75).slice(0, 20).map((food)');

fs.writeFileSync('src/App.tsx', code);
