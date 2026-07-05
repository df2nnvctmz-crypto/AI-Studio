import fs from 'fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const start = app.indexOf('const filteredFoods = allFoods.filter(food => {');
const end = app.indexOf('  const popularSearches', start);
console.log(app.substring(start, end));

