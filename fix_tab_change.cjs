const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onClick=\{() => setActiveTab\("profile"\)\}/g, 'onClick={() => handleTabChange("profile")}');

fs.writeFileSync('src/App.tsx', code);
