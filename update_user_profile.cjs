const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldProfile = `const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { height: 175, weight: 70, dietaryPreference: 'None' };
  });`;

const newProfile = `const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { 
      height: 190, 
      weight: 93, 
      age: 23,
      sex: 'Male',
      colorScheme: 'Auto',
      activityLevel: 'Active',
      dietaryPreference: 'None' 
    };
  });`;

code = code.replace(oldProfile, newProfile);
fs.writeFileSync('src/App.tsx', code);
