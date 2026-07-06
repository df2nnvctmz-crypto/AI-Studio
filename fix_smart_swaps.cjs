const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[searchFavoritesOnly, setSearchFavoritesOnly\] = useState<boolean>\(false\);/,
  'const [searchFavoritesOnly, setSearchFavoritesOnly] = useState<boolean>(false);\n  const [swapsFavoritesOnly, setSwapsFavoritesOnly] = useState<boolean>(false);'
);

const oldSwapsHeader = `<h3 className="text-[20px] font-bold text-neutral-900 tracking-tight">
                    Recommended for You
                  </h3>
                  <button onClick={() => setActiveTab("profile")} className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">
                    <Settings2 className="w-3 h-3" />
                    {userProfile.dietaryPreference === 'None' ? 'Balanced' : userProfile.dietaryPreference}
                  </button>`;

const newSwapsHeader = `<h3 className="text-[20px] font-bold text-neutral-900 tracking-tight">
                    Recommended for You
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSwapsFavoritesOnly(!swapsFavoritesOnly)}
                      className={\`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors \${swapsFavoritesOnly ? 'text-white bg-rose-500 border border-rose-500' : 'text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'}\`}
                    >
                      <Heart className={\`w-3 h-3 \${swapsFavoritesOnly ? 'fill-white' : ''}\`} />
                      {language === 'en' ? 'Favorites' : 'Favoriten'}
                    </button>
                    <button onClick={() => handleTabChange("profile")} className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">
                      <Settings2 className="w-3 h-3" />
                      {userProfile.dietaryPreference === 'None' ? 'Balanced' : userProfile.dietaryPreference}
                    </button>
                  </div>`;

code = code.replace(oldSwapsHeader, newSwapsHeader);

const oldSwapsMap = `{recommendedSwaps.map((swap, index) => {
                    const fromFood = allFoods.find(f => f.id === swap.fromId);
                    const toFood = allFoods.find(f => f.id === swap.toId);
                    if (!fromFood || !toFood) return null;

                    // Filter out proposed swap if it doesn't match current dietary preferences
                    if (!matchesDietaryPreference(toFood, userProfile.dietaryPreference)) return null;`;

const newSwapsMap = `{recommendedSwaps.filter(swap => {
                    const fromFood = allFoods.find(f => f.id === swap.fromId);
                    const toFood = allFoods.find(f => f.id === swap.toId);
                    if (!fromFood || !toFood) return false;
                    if (swapsFavoritesOnly && !favoriteFoodIds.includes(swap.fromId) && !favoriteFoodIds.includes(swap.toId)) return false;
                    if (!matchesDietaryPreference(toFood, userProfile.dietaryPreference)) return false;
                    return true;
                  }).slice(0, 20).map((swap, index) => {
                    const fromFood = allFoods.find(f => f.id === swap.fromId)!;
                    const toFood = allFoods.find(f => f.id === swap.toId)!;
                    
                    const scoreDiff = Math.round(toFood.health_score - fromFood.health_score);
                    const isExpanded = expandedSwapId === swap.fromId;`;

code = code.replace(oldSwapsMap + '\n\n                    const scoreDiff = Math.round(toFood.health_score - fromFood.health_score);\n                    const isExpanded = expandedSwapId === swap.fromId;', newSwapsMap);

fs.writeFileSync('src/App.tsx', code);
