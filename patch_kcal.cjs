const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bmr = 'Math.round((10 * userProfile.weight + 6.25 * userProfile.height - 5 * 30 + 5) * 1.2)';

code = code.replace(
  'onClick={() => alert("User profile settings coming soon!")}',
  'onClick={() => setIsProfileOpen(true)}'
);

code = code.replace(
  '3.463 kcal',
  `{${bmr}.toLocaleString()} kcal`
);

fs.writeFileSync('src/App.tsx', code);
