const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add expandedBillId state
code = code.replace(
  "const [isDragging, setIsDragging] = useState(false);",
  "const [isDragging, setIsDragging] = useState(false);\n  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);"
);

// 2. Add calculation for avgHealthScore
const scoreCalc = `  const avgHealthScore = receipts.length > 0 ? Math.round(receipts.reduce((acc, r) => acc + r.score, 0) / receipts.length) : 0;
  const healthOffset = 264 - (264 * (avgHealthScore / 100));

  useEffect(() => {
    // Retrigger animations when category filters are swapped`;

code = code.replace(
  "useEffect(() => {\n    // Retrigger animations when category filters are swapped",
  scoreCalc
);

// 3. Update Health Points Card (both occurrences)
code = code.replace(
  /<circle \s*cx="50" cy="50" r="42" fill="none" stroke="#519D46" strokeWidth="10" \s*strokeDasharray="264" strokeDashoffset="264" strokeLinecap="round" \s*\/>/g,
  `<circle 
                      cx="50" cy="50" r="42" fill="none" stroke="#519D46" strokeWidth="10" 
                      strokeDasharray="264" strokeDashoffset={healthOffset} strokeLinecap="round" 
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />`
);

code = code.replace(
  /<span className="text-3xl font-bold text-\[\#3B7A32\] leading-none">0%<\/span>/g,
  `<span className="text-3xl font-bold text-[#3B7A32] leading-none">{avgHealthScore}%</span>`
);

code = code.replace(
  /<span className="text-4xl font-bold text-\[\#3B7A32\] leading-none">0%<\/span>/g,
  `<span className="text-4xl font-bold text-[#3B7A32] leading-none">{avgHealthScore}%</span>`
);

fs.writeFileSync('src/App.tsx', code);
