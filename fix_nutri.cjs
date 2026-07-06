const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(/'Nutri-Score A'/g, "'NUTRI SCORE A'");
code = code.replace(/'Nutri-Score B'/g, "'NUTRI SCORE B'");
code = code.replace(/'Nutri-Score C'/g, "'NUTRI SCORE C'");
code = code.replace(/'Nutri-Score D'/g, "'NUTRI SCORE D'");
code = code.replace(/'Nutri-Score E'/g, "'NUTRI SCORE E'");

fs.writeFileSync('src/data.ts', code);
