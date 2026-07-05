const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const profileTabCode = `
          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === "profile" && (
            <div className="px-5 pt-8 space-y-8">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-[40px] font-bold text-neutral-900 tracking-tight leading-none">
                  My Profile
                </h1>
                <p className="text-[17px] text-neutral-500 font-medium">
                  Personalise your nutrition experience
                </p>
              </div>
              
              {/* Daily Calorie Target Card */}
              <div className="bg-[#EAF3EB] rounded-[24px] p-6 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <h3 className="text-[#3B7A32] text-xs font-bold tracking-wider uppercase">
                    Daily Calorie Target
                  </h3>
                  <div className="text-[32px] font-bold text-neutral-900 leading-none">
                    {(() => {
                      const baseBmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * (userProfile.age || 23);
                      const bmr = userProfile.sex === 'Female' ? baseBmr - 161 : baseBmr + 5;
                      const multiplier = userProfile.activityLevel === 'Active' ? 1.55 : 1.2;
                      return Math.round(bmr * multiplier).toLocaleString();
                    })()} kcal
                  </div>
                  <p className="text-[#7F9E82] text-sm font-medium">
                    Calculated from your profile
                  </p>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <svg className="w-8 h-8 text-[#519D46]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">Appearance</h2>
                </div>
                <div className="bg-white border border-[#E5EAE3] rounded-[24px] p-5 shadow-sm">
                  <p className="text-[15px] text-neutral-500 font-medium mb-4">Color scheme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Light', 'Auto', 'Dark'].map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => setUserProfile(p => ({ ...p, colorScheme: scheme }))}
                        className={\`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border \${
                          userProfile.colorScheme === scheme 
                            ? 'border-[#519D46] bg-[#F7FBF6] text-[#519D46]' 
                            : 'border-[#E5EAE3] bg-[#FDFDFD] text-neutral-500'
                        } transition-colors\`}
                      >
                        {scheme === 'Light' && <Sun className="w-5 h-5" />}
                        {scheme === 'Auto' && <Smartphone className="w-5 h-5" />}
                        {scheme === 'Dark' && <Moon className="w-5 h-5" />}
                        <span className="text-[13px] font-semibold">{scheme}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">Personal Info</h2>
                </div>
                <div className="bg-white border border-[#E5EAE3] rounded-[24px] p-5 shadow-sm space-y-6">
                  <div>
                    <p className="text-[15px] text-neutral-500 font-medium mb-3">Biological sex</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map(sex => (
                        <button
                          key={sex}
                          onClick={() => setUserProfile(p => ({ ...p, sex }))}
                          className={\`py-3.5 rounded-[16px] font-bold text-[15px] transition-colors border \${
                            userProfile.sex === sex 
                              ? 'bg-[#519D46] border-[#519D46] text-white shadow-sm' 
                              : 'bg-[#FDFDFD] border-[#E5EAE3] text-neutral-500'
                          }\`}
                        >
                          {sex}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">Age</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.age || ''}
                          onChange={e => setUserProfile(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">yrs</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">Weight</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.weight || ''}
                          onChange={e => setUserProfile(p => ({ ...p, weight: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">kg</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] text-neutral-400 font-medium mb-2">Height</p>
                      <div className="w-full bg-[#FDFDFD] border border-[#E5EAE3] rounded-[16px] py-3 flex flex-col items-center relative overflow-hidden">
                        <input
                          type="number"
                          value={userProfile.height || ''}
                          onChange={e => setUserProfile(p => ({ ...p, height: parseInt(e.target.value) || 0 }))}
                          className="w-full text-center text-xl font-bold text-neutral-900 bg-transparent outline-none appearance-none"
                        />
                        <span className="text-[11px] font-semibold text-neutral-400">cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Level Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#519D46]" />
                  <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">Activity Level</h2>
                </div>
                <div className="bg-white border border-[#E5EAE3] rounded-[24px] p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {['Sedentary', 'Active'].map(level => (
                      <button
                        key={level}
                        onClick={() => setUserProfile(p => ({ ...p, activityLevel: level }))}
                        className={\`py-3.5 rounded-[16px] font-bold text-[15px] transition-colors border \${
                          userProfile.activityLevel === level 
                            ? 'bg-[#EAF3EB] border-[#519D46] text-[#2F7E41]' 
                            : 'bg-[#FDFDFD] border-[#E5EAE3] text-neutral-500'
                        }\`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
`;

const searchTabStart = '{/* ==================== SEARCH TAB ==================== */}';
code = code.replace(searchTabStart, profileTabCode + '\n' + searchTabStart);
fs.writeFileSync('src/App.tsx', code);
