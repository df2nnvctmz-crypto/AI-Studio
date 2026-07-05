import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const funcsToInsert = `
const getMacroDV = (macroName: string, amount: number) => {
  const standards: Record<string, number> = {
    kcal: 2000,
    protein_g: 50,
    carbs_g: 275,
    fiber_g: 28,
    sugar_g: 50,
    fat_g: 78,
    saturated_fat_g: 20,
    salt_g: 6 
  };
  const standard = standards[macroName] || 100;
  return Math.round((amount / standard) * 100);
};

const isBetterNutrient = (macroName: string, fromVal: number, toVal: number) => {
  if (macroName === 'protein_g' || macroName === 'fiber_g') {
    return toVal >= fromVal;
  }
  return toVal <= fromVal;
};

const ScoreRing = ({ score, size = 64, strokeWidth = 5 }: { score: number, size?: number, strokeWidth?: number }) => {
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetOffset = circumference - (circumference * validScore) / 100;
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [validScore, circumference]);
  
  const colors = getScoreColors(validScore);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle className="text-neutral-100 dark:text-neutral-800" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
        <circle className={colors.text} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={\`text-sm font-bold \${colors.text}\`}>{Math.round(validScore)}</span>
      </div>
    </div>
  );
};

`;

app = app.replace('const translateCategoryName', funcsToInsert + 'const translateCategoryName');
fs.writeFileSync('src/App.tsx', app);
