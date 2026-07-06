const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(/swap_suggestion_id: string \| null;/g, 'swap_suggestion_id: string | null;\n  nova_group?: number;');
fs.writeFileSync('src/data.ts', code);
