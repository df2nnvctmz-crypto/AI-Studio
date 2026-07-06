const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-white border border-\[#E5EAE3\] rounded-\[24px\]/g, 'bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 rounded-[24px]');
code = code.replace(/bg-white border border-\[#E5EAE3\] hover:border-neutral-300 rounded-full/g, 'bg-white dark:bg-neutral-900 border border-[#E5EAE3] dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-full text-neutral-600 dark:text-neutral-400');
code = code.replace(/bg-white rounded-\[1\.25rem\] border border-\[#E5EAE3\]/g, 'bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800');
code = code.replace(/bg-white rounded-xl border border-\[#E5EAE3\]/g, 'bg-white dark:bg-neutral-900 rounded-xl border border-[#E5EAE3] dark:border-neutral-800');
code = code.replace(/bg-white border-2 border-\[#E5EAE3\]/g, 'bg-white dark:bg-neutral-900 border-2 border-[#E5EAE3] dark:border-neutral-800 dark:text-neutral-200');

fs.writeFileSync('src/App.tsx', code);
