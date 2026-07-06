const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldButton = `<button onClick={() => handleTabChange("profile")} className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors">
                      <Settings2 className="w-3 h-3" />
                      {userProfile.dietaryPreference === 'None' ? 'Balanced' : userProfile.dietaryPreference}
                    </button>`;

const newSelect = `<div className="relative inline-flex items-center">
                      <Settings2 className="w-3 h-3 absolute left-2.5 text-[#2F7E41] dark:text-emerald-400 pointer-events-none" />
                      <select 
                        value={userProfile.dietaryPreference}
                        onChange={(e) => setUserProfile(p => ({ ...p, dietaryPreference: e.target.value }))}
                        className="text-xs font-semibold text-[#2F7E41] dark:text-emerald-400 bg-[#EAF3EB] dark:bg-emerald-900/30 border border-[#CDE5CE] dark:border-emerald-800 rounded-full cursor-pointer hover:bg-[#DCEFDE] dark:hover:bg-emerald-800/40 transition-colors appearance-none pl-6 pr-3 py-1 outline-none"
                      >
                        <option value="None">{language === 'en' ? 'Balanced' : 'Ausgewogen'}</option>
                        <option value="High Protein">{language === 'en' ? 'High Protein' : 'Viel Eiweiß'}</option>
                        <option value="Low Carb">{language === 'en' ? 'Low Carb' : 'Wenig Kohlenhydrate'}</option>
                        <option value="Vegetarian">{language === 'en' ? 'Vegetarian' : 'Vegetarisch'}</option>
                        <option value="Vegan">{language === 'en' ? 'Vegan' : 'Vegan'}</option>
                      </select>
                    </div>`;

code = code.replace(oldButton, newSelect);

fs.writeFileSync('src/App.tsx', code);
