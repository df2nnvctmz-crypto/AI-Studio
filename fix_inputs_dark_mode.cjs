const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-\[#EEF2ED\] border-0 rounded-2xl text-\[15px\] font-medium text-neutral-800 placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500\/30 focus:bg-white/g, 
  'bg-[#EEF2ED] dark:bg-neutral-800 border-0 rounded-2xl text-[15px] font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-neutral-900');

code = code.replace(/className="w-full bg-\[#EEF2ED\] border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500\/30"/g, 
  'className="w-full bg-[#EEF2ED] dark:bg-neutral-800 dark:text-neutral-200 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/30"');

fs.writeFileSync('src/App.tsx', code);
