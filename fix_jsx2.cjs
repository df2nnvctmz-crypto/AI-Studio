const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* iOS Style Search Box \*\/\}[\s\S]*?<SlidersHorizontal className="w-5 h-5" \/>\n\s*<\/button>\n\s*<\/div>/;

const injection = `{/* iOS Style Search Box with Filter Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-[#EEF2ED] border-0 rounded-2xl text-[15px] font-medium text-neutral-800 placeholder-neutral-400 focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        triggerHaptic();
                        setSearchQuery("");
                      }}
                      className="absolute inset-y-0 right-3.5 flex items-center text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-5 h-5 bg-neutral-200 hover:bg-neutral-300 rounded-full p-0.5" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => { triggerHaptic(); setShowAdvancedFilters(!showAdvancedFilters); }}
                  className={\`p-3 rounded-2xl flex-shrink-0 transition-colors \${showAdvancedFilters ? 'bg-emerald-500 text-white' : 'bg-[#EEF2ED] text-neutral-600 hover:bg-[#E5EAE3]'}\`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>`;

code = code.replace(regex, injection);

fs.writeFileSync('src/App.tsx', code);
