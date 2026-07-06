const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldScoreRing = `const ScoreRing = ({ score, size = 64, strokeWidth = 5 }: { score: number, size?: number, strokeWidth?: number }) => {
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
};`;

const newScoreRing = `const ScoreRing = ({ score, size = 64, strokeWidth = 5, textSizeClass }: { score: number, size?: number, strokeWidth?: number, textSizeClass?: string }) => {
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
  const computedTextClass = textSizeClass || (size >= 96 ? "text-4xl" : size >= 84 ? "text-3xl" : size >= 64 ? "text-xl" : "text-sm");
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle className="text-neutral-100 dark:text-neutral-800" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
        <circle className={colors.text} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={\`\${computedTextClass} font-bold \${colors.text}\`}>{Math.round(validScore)}</span>
      </div>
    </div>
  );
};`;

if (code.includes(oldScoreRing)) {
  code = code.replace(oldScoreRing, newScoreRing);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully updated ScoreRing');
} else {
  console.log('Could not find exact ScoreRing code match');
}
