const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldButton2 = `<button onClick={() => setActiveTab("profile")} className="text-xs font-semibold text-[#519D46] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">
                    {userProfile.dietaryPreference === 'None' ? (language === 'en' ? 'Balanced' : 'Ausgewogen') : (language === 'en' ? userProfile.dietaryPreference : userProfile.dietaryPreference === 'High Protein' ? 'Viel Eiweiß' : userProfile.dietaryPreference === 'Low Carb' ? 'Wenig Kohlenhydrate' : userProfile.dietaryPreference === 'Vegetarian' ? 'Vegetarisch' : userProfile.dietaryPreference === 'Vegan' ? 'Vegan' : userProfile.dietaryPreference)}
                  </button>`;

const newSelect2 = `<div className="relative inline-flex items-center">
                    <select 
                      value={userProfile.dietaryPreference}
                      onChange={(e) => setUserProfile(p => ({ ...p, dietaryPreference: e.target.value }))}
                      className="text-xs font-semibold text-[#519D46] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 px-3 py-1 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors appearance-none outline-none"
                    >
                      <option value="None">{language === 'en' ? 'Balanced' : 'Ausgewogen'}</option>
                      <option value="High Protein">{language === 'en' ? 'High Protein' : 'Viel Eiweiß'}</option>
                      <option value="Low Carb">{language === 'en' ? 'Low Carb' : 'Wenig Kohlenhydrate'}</option>
                      <option value="Vegetarian">{language === 'en' ? 'Vegetarian' : 'Vegetarisch'}</option>
                      <option value="Vegan">{language === 'en' ? 'Vegan' : 'Vegan'}</option>
                    </select>
                  </div>`;

code = code.replace(oldButton2, newSelect2);

fs.writeFileSync('src/App.tsx', code);
