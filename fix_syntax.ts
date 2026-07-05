import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/div><div className="flex-shrink-0 -mt-2">[\s\S]*?ScoreRing[\s\S]*?<\/div>\s*<\/div>\s*\}\s*<\/div>\s*<\/div>\s*\{\/\* Detailed Nutrition Facts Panel \*\/\}/;

const replacement = `</div>
                  <div className="flex-shrink-0 -mt-2">
                    <ScoreRing score={currentFoodDetail.health_score} size={96} strokeWidth={6.5} />
                  </div>
                </div>

                {/* Detailed Nutrition Facts Panel */}`;

if (regex.test(app)) {
  app = app.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', app);
  console.log("Replaced target");
} else {
  console.log("Target not found!");
}
