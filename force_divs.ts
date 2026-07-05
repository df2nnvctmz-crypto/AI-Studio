import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/>/;
if (regex.test(app)) {
  app = app.replace(regex, `</div></div></div></div></>`);
  fs.writeFileSync('src/App.tsx', app);
  console.log("Forced Divs!");
}
