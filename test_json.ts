import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/foods.json', 'utf8'));
console.log(data[0]);
