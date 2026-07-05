import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/\{nova\.name\}/g, '{nova.label}');
fs.writeFileSync('src/App.tsx', app);

