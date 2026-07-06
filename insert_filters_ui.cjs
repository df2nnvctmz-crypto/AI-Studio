const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\* iOS Style Search Box \*\/\n\s*<div className="relative">/;

const injection = `const availableSubCategories = Array.from(new Set(allFoods.map(f => f.subCategory).filter(Boolean))) as string[];

              {/* iOS Style Search Box with Filter Toggle */}
              <div className="flex items-center gap-2">
              <div className="relative flex-1">`;

const regex2 = /\s*<X className="w-5 h-5 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5" \/>\n\s*<\/button>\n\s*\)}\n\s*<\/div>/;

const injection2 = `                    <X className="w-5 h-5 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => { triggerHaptic(); setShowAdvancedFilters(!showAdvancedFilters); }}
                className={\`p-3 rounded-2xl flex-shrink-0 transition-colors \${showAdvancedFilters ? 'bg-emerald-500 text-white' : 'bg-[#EEF2ED] text-neutral-600 hover:bg-[#E5EAE3]'}\`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              </div>
              
              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">
                  
                  {/* Category & SubCategory */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{language === 'en' ? 'Category' : 'Kategorie'}</label>
                      <select 
                        value={searchCategory} 
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full bg-[#EEF2ED] border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/30"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{translateCategoryName(cat, language)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{language === 'en' ? 'Subcategory' : 'Unterkategorie'}</label>
                      <select 
                        value={searchSubCategory} 
                        onChange={(e) => setSearchSubCategory(e.target.value)}
                        className="w-full bg-[#EEF2ED] border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="All">{language === 'en' ? 'All' : 'Alle'}</option>
                        {availableSubCategories.filter(sc => searchCategory === 'All' || allFoods.find(f => f.subCategory === sc && f.category === searchCategory)).map(sc => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nutri-Score & NOVA */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nutri-Score</label>
                      <div className="flex gap-2">
                        {['A', 'B', 'C', 'D', 'E'].map(score => {
                          const isSelected = searchNutriScores.includes(score);
                          return (
                            <button
                              key={score}
                              onClick={() => {
                                triggerHaptic();
                                setSearchNutriScores(prev => isSelected ? prev.filter(s => s !== score) : [...prev, score]);
                              }}
                              className={\`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all \${isSelected ? 'bg-neutral-800 text-white ring-2 ring-neutral-800 ring-offset-1' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}\`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">NOVA-Score</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(score => {
                          const isSelected = searchNovaScores.includes(score);
                          return (
                            <button
                              key={score}
                              onClick={() => {
                                triggerHaptic();
                                setSearchNovaScores(prev => isSelected ? prev.filter(s => s !== score) : [...prev, score]);
                              }}
                              className={\`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all \${isSelected ? 'bg-neutral-800 text-white ring-2 ring-neutral-800 ring-offset-1' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}\`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Calories Slider */}
                  <div className="space-y-2 pb-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        {language === 'en' ? 'Max Calories' : 'Max Kalorien'} <span className="text-[10px] lowercase font-medium">(/ 100g)</span>
                      </label>
                      <span className="text-sm font-bold text-emerald-600">{searchMaxCalories} kcal</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1000" 
                      step="10"
                      value={searchMaxCalories}
                      onChange={(e) => setSearchMaxCalories(parseInt(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 px-1">
                      <span>0</span>
                      <span>500</span>
                      <span>1000+</span>
                    </div>
                  </div>
                  
                </div>
              )}`;

code = code.replace(regex, injection);
code = code.replace(regex2, injection2);

fs.writeFileSync('src/App.tsx', code);
