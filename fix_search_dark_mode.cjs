const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-\[#EEF2ED\] text-neutral-600 hover:bg-\[#E5EAE3\]/g, 'bg-[#EEF2ED] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-[#E5EAE3] dark:hover:bg-neutral-700');
code = code.replace(/bg-white border border-neutral-100/g, 'bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800');

fs.writeFileSync('src/App.tsx', code);
