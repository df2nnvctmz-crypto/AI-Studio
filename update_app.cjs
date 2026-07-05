const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Navbar style (iOS style)
code = code.replace(
  'w-full bg-[#F7FBF6] border-t',
  'w-full bg-[#F7FBF6]/85 backdrop-blur-xl border-t'
);
code = code.replaceAll('text-emerald-500', 'text-[#519D46]');

// 2. Score text size in rings
code = code.replace(
  'text-4xl font-bold text-[#3B7A32]',
  'text-3xl font-bold text-[#3B7A32]'
);
code = code.replace(
  'text-3xl font-bold text-[#3B7A32]',
  'text-2xl font-bold text-[#3B7A32]'
);

// Detail score font size
code = code.replace(
  'fontSize: size * 0.35',
  'fontSize: size * 0.28'
);

// 3. User button alert
const userBtn = `<button className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>`;
const newUserBtn = `<button onClick={() => alert("User profile settings coming soon!")} className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-sm">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>`;
code = code.replace(userBtn, newUserBtn);

// 4. Scan bill set active tab
code = code.replace(
  "setReceipts(prev => [{ ...result, id: Math.random().toString(36).substr(2, 9) }, ...prev]);\n          } catch",
  "setReceipts(prev => [{ ...result, id: Math.random().toString(36).substr(2, 9) }, ...prev]);\n            setActiveTab('bill');\n          } catch"
);

fs.writeFileSync('src/App.tsx', code);
