const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const loader = `      {/* Global Loading Overlay */}
      {isGeneratingFood && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-[80vw]">
            <div className="w-8 h-8 border-4 border-[#EAF3EB] border-t-[#519D46] rounded-full animate-spin" />
            <p className="text-sm font-bold text-neutral-900 text-center">Loading nutritional data...</p>
          </div>
        </div>
      )}
`;

// Remove the incorrect one
code = code.replace(loader, "");

// Append to the correct place (end of App component)
// We will look for the very last '</div>\n    </div>\n  );\n}'
const lastReturn = `</div>
    </div>
  );
}`;

if (code.endsWith(lastReturn + "\n")) {
  code = code.substring(0, code.length - lastReturn.length - 1) + loader + lastReturn + "\n";
} else {
  // Let's just use string replace from the end
  const idx = code.lastIndexOf("    </div>\n  );\n}");
  if (idx !== -1) {
    code = code.substring(0, idx) + loader + code.substring(idx);
  }
}

fs.writeFileSync('src/App.tsx', code);
