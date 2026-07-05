import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<\/div>\s*<div className="space-y-3 pt-2 text-left">\s*<h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">\s*\{language === 'en' \? 'Nutrition Facts' : 'Nährwertangaben'\}\s*<\/h3>/;

const insert = `</div>
                
                {/* Smart Swap Recommendation */}
                {(() => {
                  const swaps = getSmartSwapsForFood(currentFoodDetail);
                  if (swaps.length === 0) {
                    return (
                      <div className="bg-[#EAF3EB] dark:bg-emerald-950/40 p-4 rounded-2xl border border-[#CDE5CE] dark:border-neutral-800 flex items-start gap-3 mt-4 text-left">
                        <div className="bg-white dark:bg-neutral-800 p-1.5 rounded-full shadow-sm text-[#519D46] dark:text-emerald-400 mt-0.5 shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                            {language === 'en' ? 'Great Choice!' : 'Gute Wahl!'}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                            {language === 'en' ? 'This product is already a healthy option in its category.' : 'Dieses Produkt ist bereits eine gesunde Option in seiner Kategorie.'}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="pt-3 pb-1 text-left space-y-3">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {language === 'en' ? 'Smarter Swap' : 'Bessere Alternative'}
                      </h3>
                      {swaps.map((swap, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleOpenFood(swap.toFood.id)}
                          className="bg-white dark:bg-neutral-900 rounded-[1.25rem] border border-[#E5EAE3] dark:border-neutral-800 p-4 shadow-sm flex gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <div className="w-[72px] h-[72px] bg-neutral-100 dark:bg-neutral-800 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                            {swap.toFood.image ? (
                              <img src={swap.toFood.image} alt={swap.toFood.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{swap.toFood.emoji || "🍎"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-xs font-bold text-[#519D46] dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                              {language === 'en' ? 'Recommended' : 'Empfohlen'}
                            </p>
                            <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
                              {swap.toFood.name}
                            </h4>
                            <p className="text-xs text-neutral-500 font-medium truncate">
                              {swap.toFood.brand || swap.toFood.category}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex items-center">
                             <div className="bg-[#EAF3EB] dark:bg-emerald-950/40 text-[#2F7E41] dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                               {swap.toFood.health_score} <span className="opacity-70">/ 100</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="space-y-3 pt-2 text-left">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {language === 'en' ? 'Nutrition Facts' : 'Nährwertangaben'}
                  </h3>`;

if (regex.test(code)) {
  code = code.replace(regex, insert);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced!");
} else {
  console.log("Regex not found!");
}
