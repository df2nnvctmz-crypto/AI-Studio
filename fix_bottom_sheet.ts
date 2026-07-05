import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/>\s*\}\)\s*\{\/\* Global Loading Overlay \*\/\}/;
if (regex.test(app)) {
  app = app.replace(regex, `</div></div></div></>)} {/* Global Loading Overlay */}`);
  fs.writeFileSync('src/App.tsx', app);
  console.log("Replaced");
} else {
  console.log("Regex not found!");
}
