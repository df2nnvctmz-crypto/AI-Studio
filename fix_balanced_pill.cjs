const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span className="text-xs font-semibold text-\[#519D46\] bg-\[#EAF3EB\] px-2\.5 py-1 rounded-full">/g, 
  '<button onClick={() => setActiveTab("profile")} className="text-xs font-semibold text-[#519D46] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">');
  
code = code.replace(/<span className="text-xs font-semibold text-\[#2F7E41\] bg-\[#EAF3EB\] border border-\[#CDE5CE\] px-2\.5 py-1 rounded-full flex items-center gap-1">/g, 
  '<button onClick={() => setActiveTab("profile")} className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">');
  
code = code.replace(/<\/span>\n([ ]+)<\/div>\n([ ]+)<div className="flex gap-4 overflow-x-auto/g, 
  '</button>\n$1</div>\n$2<div className="flex gap-4 overflow-x-auto');

code = code.replace(/<\/span>\n([ ]+)<\/div>\n([ ]+)<div className="space-y-3">/g, 
  '</button>\n$1</div>\n$2<div className="space-y-3">');

fs.writeFileSync('src/App.tsx', code);
