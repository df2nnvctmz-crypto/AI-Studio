import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `              </div>\n</>\n        )}`;

if (code.includes(target)) {
  code = code.replace(target, `              </div></div></>\n        )}`);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced target");
} else {
  console.log("Target not found!");
}
