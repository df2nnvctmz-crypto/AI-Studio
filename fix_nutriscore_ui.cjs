const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/Nutri-Score/g, 'Nutri Score');
code = code.replace(/tracking-wide \$\{nova\.color\}/g, 'tracking-wide whitespace-nowrap ${nova.color}');

fs.writeFileSync('src/App.tsx', code);
