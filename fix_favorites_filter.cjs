const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[searchNovaScores, setSearchNovaScores\] = useState<number\[\]>\(\[\]\);/,
  'const [searchNovaScores, setSearchNovaScores] = useState<number[]>([]);\n  const [searchFavoritesOnly, setSearchFavoritesOnly] = useState<boolean>(false);'
);

code = code.replace(
  /if \(searchNovaScores\.length > 0 && \(\!food\.nova_group \|\| \!searchNovaScores\.includes\(food\.nova_group\)\)\) \{\n        advancedMatches = false;\n      \}/,
  'if (searchNovaScores.length > 0 && (!food.nova_group || !searchNovaScores.includes(food.nova_group))) {\n        advancedMatches = false;\n      }\n      if (searchFavoritesOnly && !favoriteFoodIds.includes(food.id)) {\n        advancedMatches = false;\n      }'
);

const newCheckboxUI = `
                  {/* Favorites Only Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{language === 'en' ? 'Favorites Only' : 'Nur Favoriten'}</label>
                    <button
                      onClick={() => setSearchFavoritesOnly(!searchFavoritesOnly)}
                      className={\`w-11 h-6 rounded-full transition-colors relative \${searchFavoritesOnly ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700'}\`}
                    >
                      <div className={\`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform \${searchFavoritesOnly ? 'translate-x-5' : 'translate-x-0'}\`} />
                    </button>
                  </div>
`;

code = code.replace(
  /\{showAdvancedFilters && \(\n([ ]+)<div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">/,
  `{showAdvancedFilters && (
$1<div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">` + newCheckboxUI
);

fs.writeFileSync('src/App.tsx', code);
