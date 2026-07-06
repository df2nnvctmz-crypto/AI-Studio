const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const injection = `const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchSubCategory, setSearchSubCategory] = useState("All");
  const [searchNutriScores, setSearchNutriScores] = useState<string[]>([]);
  const [searchNovaScores, setSearchNovaScores] = useState<number[]>([]);
  const [searchMaxCalories, setSearchMaxCalories] = useState<number>(1000);`;

code = code.replace(/const \[selectedCategory, setSelectedCategory\] = useState\("All"\);/, injection);
fs.writeFileSync('src/App.tsx', code);
