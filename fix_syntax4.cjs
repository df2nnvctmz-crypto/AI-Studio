const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("                            })\n                          </div>", "                            })}\n                          </div>");
fs.writeFileSync('src/App.tsx', code);
