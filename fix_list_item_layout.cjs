const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLeft = `<div className="flex items-center gap-3">
                          <div className={\`p-2 rounded-lg \${colors.bg} \${colors.text}\`}>
                            <Apple className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-[15px]">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                                {(food.subCategory || "Grocery")}
                              </span>
                              <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap \${nova.color}\`}>
                                {nova.label}
                              </span>
                            </div>
                          </div>
                        </div>`;

const newLeft = `<div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className={\`p-2 rounded-lg \${colors.bg} \${colors.text} flex-shrink-0\`}>
                            <Apple className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-[15px] truncate">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium truncate max-w-[80px] sm:max-w-none">
                                {(food.subCategory || "Grocery")}
                              </span>
                              <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap \${nova.color}\`}>
                                {nova.label}
                              </span>
                            </div>
                          </div>
                        </div>`;

const oldRight = `<div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-550">
                            {Math.round(food.nutrients_per_100.kcal)} kcal / 100g
                          </span>`;

const newRight = `<div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-550 whitespace-nowrap hidden min-[400px]:inline-block">
                            {Math.round(food.nutrients_per_100.kcal)} kcal <span className="hidden sm:inline">/ 100g</span>
                          </span>`;

code = code.replace(oldLeft, newLeft);
code = code.replace(oldRight, newRight);

fs.writeFileSync('src/App.tsx', code);
