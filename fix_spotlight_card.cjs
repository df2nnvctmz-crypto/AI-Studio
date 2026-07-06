const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<div className="bg-\[#F7FBF6\] rounded-xl flex items-center justify-between p-4 mt-4">/g, 
  '<div className="bg-[#F7FBF6] dark:bg-neutral-800 rounded-xl flex items-center justify-between p-4 mt-4">');

code = code.replace(/className="text-sm font-bold text-neutral-900"/g, 
  'className="text-sm font-bold text-neutral-900 dark:text-neutral-100"');

code = code.replace(/<div className="w-px h-8 bg-\[#E5EAE3\]" \/>/g, 
  '<div className="w-px h-8 bg-[#E5EAE3] dark:bg-neutral-700" />');

code = code.replace(/className="bg-white rounded-\[1\.25rem\] border border-\[#E5EAE3\] p-5 shadow-\[0_2px_10px_rgba\(0,0,0,0\.02\)\]/g, 
  'className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]');

code = code.replace(/className="text-\[22px\] font-bold text-neutral-900 leading-tight"/g, 
  'className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight"');

// also the recommended cards:
code = code.replace(/className="w-\[140px\] shrink-0 bg-white rounded-\[1\.25rem\] border border-\[#E5EAE3\] p-4 shadow-\[0_2px_10px_rgba\(0,0,0,0\.02\)\]/g, 
  'className="w-[140px] shrink-0 bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]');

fs.writeFileSync('src/App.tsx', code);
