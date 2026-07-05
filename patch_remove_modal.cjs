const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove isProfileOpen state
code = code.replace('const [isProfileOpen, setIsProfileOpen] = useState(false);\n  ', '');

// Remove the Profile Modal
const startTag = '{/* Profile Modal */}';
const startIndex = code.indexOf(startTag);
if (startIndex !== -1) {
  // Finding where it ends
  const endTag = '      {/* Global Loading Overlay */}';
  const endIndex = code.indexOf(endTag);
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
  }
}

fs.writeFileSync('src/App.tsx', code);
