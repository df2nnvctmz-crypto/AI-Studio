const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add Filter icon to lucide-react imports
if (!code.includes('Filter,')) {
    code = code.replace(/ArrowLeft,/, 'ArrowLeft, Filter, SlidersHorizontal, ChevronDown, ChevronUp,');
}

fs.writeFileSync('src/App.tsx', code);
