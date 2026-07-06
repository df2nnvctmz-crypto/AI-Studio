const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/ArrowLeft, Filter, SlidersHorizontal, ChevronDown, ChevronUp,/, 'ArrowLeft, Filter, SlidersHorizontal, ChevronUp,');

fs.writeFileSync('src/App.tsx', code);
