const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-white border border-\[#E5EAE3\] text-neutral-900 shadow-sm active:scale-95/g, 'bg-white dark:bg-neutral-800 border border-[#E5EAE3] dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm active:scale-95');

fs.writeFileSync('src/App.tsx', code);
