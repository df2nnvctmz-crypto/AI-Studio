const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importStr = "import {";
const newImportStr = "import {\n  Sun,\n  Moon,\n  Smartphone,\n  Eye,\n  User,\n  Activity,";
code = code.replace(importStr, newImportStr);

fs.writeFileSync('src/App.tsx', code);
