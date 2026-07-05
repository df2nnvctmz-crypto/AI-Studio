import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// replace the search matches logic:
const searchLogicOld = `const validScore = isNaN(score) ? 0 : score;`;
const searchLogicNew = `const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;`;
app = app.replace(searchLogicOld, searchLogicNew);

const searchLogicOld2 = `const validAvgHealthScore = isNaN(avgHealthScore) ? 0 : avgHealthScore;`;
const searchLogicNew2 = `const validAvgHealthScore = typeof avgHealthScore === 'number' && !isNaN(avgHealthScore) ? avgHealthScore : 0;`;
app = app.replace(searchLogicOld2, searchLogicNew2);

fs.writeFileSync('src/App.tsx', app);

