const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<\/span>\n([ ]+)<\/div>\n([ ]+)<div className="flex gap-4 overflow-x-auto/g, 
  '</button>\n$1</div>\n$2<div className="flex gap-4 overflow-x-auto');

code = code.replace(/<\/span>\n([ ]+)<\/div>\n([ ]+)<div className="space-y-3">/g, 
  '</button>\n$1</div>\n$2<div className="space-y-3">');

// The replacement above failed in fix_balanced_pill.cjs probably because the spacing didn't match. Let me just replace the specific `</span>` tags.

const lines = code.split('\n');

for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('text-[#519D46] dark:text-emerald-400 bg-[#EAF3EB]')) {
    // Look ahead a bit
    for (let j=i; j<i+5; j++) {
      if (lines[j].includes('</span>')) {
        lines[j] = lines[j].replace('</span>', '</button>');
        break;
      }
    }
  }
  
  if (lines[i].includes('text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB]')) {
    // Look ahead a bit
    for (let j=i; j<i+5; j++) {
      if (lines[j].includes('</span>')) {
        lines[j] = lines[j].replace('</span>', '</button>');
        break;
      }
    }
  }
}

code = lines.join('\n');
fs.writeFileSync('src/App.tsx', code);
