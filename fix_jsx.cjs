const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const availableSubCategories = Array\.from\(new Set\(allFoods\.map\(f => f\.subCategory\)\.filter\(Boolean\)\)\) as string\[\];\n\n              \{\/\* iOS Style Search Box/g, '{/* iOS Style Search Box');

fs.writeFileSync('src/App.tsx', code);
