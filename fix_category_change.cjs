const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onChange=\{\(e\) => setSearchCategory\(e\.target\.value\)\}/g, 'onChange={(e) => { setSearchCategory(e.target.value); setSearchSubCategory("All"); }}');

fs.writeFileSync('src/App.tsx', code);
