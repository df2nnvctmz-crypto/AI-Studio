const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newState = `  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    height: 175,
    weight: 70,
    dietaryPreference: 'None'
  });
`;

code = code.replace(
  '  const [isGeneratingFood, setIsGeneratingFood] = useState(false);',
  '  const [isGeneratingFood, setIsGeneratingFood] = useState(false);\n' + newState
);

fs.writeFileSync('src/App.tsx', code);
