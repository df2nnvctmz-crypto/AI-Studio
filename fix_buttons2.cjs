const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span className="text-\[13px\] font-bold text-\[#2F7E41\] dark:text-emerald-400 bg-\[#EAF3EB\] dark:bg-emerald-950\/45 px-3 py-1 rounded-full whitespace-nowrap">\n([ ]+)\+\{scoreDiff\}%\n([ ]+)<\/button>/g, '<span className="text-[13px] font-bold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-950/45 px-3 py-1 rounded-full whitespace-nowrap">\n$1+{scoreDiff}%\n$2</span>');

code = code.replace(/<span>\{language === 'en' \? 'Show Less' : 'Weniger anzeigen'\}<\/button>/g, '<span>{language === \'en\' ? \'Show Less\' : \'Weniger anzeigen\'}</span>');

code = code.replace(/<span>\{language === 'en' \? 'Show More' : 'Mehr anzeigen'\}<\/button>/g, '<span>{language === \'en\' ? \'Show More\' : \'Mehr anzeigen\'}</span>');

fs.writeFileSync('src/App.tsx', code);
