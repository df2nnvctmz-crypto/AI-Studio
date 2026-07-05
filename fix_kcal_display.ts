import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div className="flex-shrink-0 -mt-2">
                    <ScoreRing score={currentFoodDetail.health_score} size={96} strokeWidth={6.5} />`;

const replacement = `<div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-bold text-[#519D46] dark:text-emerald-400">{currentFoodDetail.nutrients_per_100.kcal}</span>
                      <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">kcal</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 -mt-2">
                    <ScoreRing score={currentFoodDetail.health_score} size={96} strokeWidth={6.5} />`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
