const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const loader = `
      {/* Global Loading Overlay */}
      {isGeneratingFood && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-[80vw]">
            <div className="w-8 h-8 border-4 border-[#EAF3EB] border-t-[#519D46] rounded-full animate-spin" />
            <p className="text-sm font-bold text-neutral-900 text-center">Loading nutritional data...</p>
          </div>
        </div>
      )}
`;

code = code.replace("    </div>\n  );\n}", loader + "    </div>\n  );\n}");

fs.writeFileSync('src/App.tsx', code);
