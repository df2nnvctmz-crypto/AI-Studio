const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/if \(searchNovaScores\.length > 0 && food\.nova_group && !searchNovaScores\.includes\(food\.nova_group\)\) \{/g, 'if (searchNovaScores.length > 0 && (!food.nova_group || !searchNovaScores.includes(food.nova_group))) {');

fs.writeFileSync('src/App.tsx', code);
