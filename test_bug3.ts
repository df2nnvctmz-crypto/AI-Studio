import fs from 'fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');

// just extract the filter block exactly as it is in the file
const start = app.indexOf('const filteredFoods = allFoods.filter(food => {');
const end = app.indexOf('  const popularSearches', start);
console.log(app.substring(start, end));

