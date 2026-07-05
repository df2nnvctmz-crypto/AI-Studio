import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<\/div><\/div><\/>        \}\)\{\/\* Global Loading Overlay \*\/\}/, '</div>\n</div>\n</>\n)}\n{/* Global Loading Overlay */}');
code = code.replace(/<\/div><\/div><\/>        \}\)/, '</div>\n</div>\n</>\n)}\n');

fs.writeFileSync('src/App.tsx', code);
