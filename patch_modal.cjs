const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const profileModal = `
      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsProfileOpen(false)}>
          <div 
            className="bg-[#F7FBF6] w-full max-w-[430px] mx-auto rounded-t-3xl p-6 space-y-6 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto -mt-2 mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Your Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1.5">Dietary Preference</label>
                <select 
                  value={userProfile.dietaryPreference}
                  onChange={e => setUserProfile(prev => ({ ...prev, dietaryPreference: e.target.value }))}
                  className="w-full bg-white border border-[#E5EAE3] rounded-xl p-3.5 text-neutral-900 font-medium focus:outline-none focus:border-[#519D46] appearance-none"
                >
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1.5">Height (cm)</label>
                  <input 
                    type="number" 
                    value={userProfile.height}
                    onChange={e => setUserProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white border border-[#E5EAE3] rounded-xl p-3.5 text-neutral-900 font-medium focus:outline-none focus:border-[#519D46]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1.5">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={userProfile.weight}
                    onChange={e => setUserProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-white border border-[#E5EAE3] rounded-xl p-3.5 text-neutral-900 font-medium focus:outline-none focus:border-[#519D46]"
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="w-full bg-[#519D46] hover:bg-[#438739] transition-colors text-white py-4 rounded-[1.25rem] font-bold text-base shadow-sm mt-4"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
`;

const replaceIndex = code.lastIndexOf('{/* Global Loading Overlay */}');
code = code.substring(0, replaceIndex) + profileModal + code.substring(replaceIndex);

fs.writeFileSync('src/App.tsx', code);
