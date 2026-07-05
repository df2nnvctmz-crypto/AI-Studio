import fs from 'fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const filteredFoods = allFoods\.filter\(([\s\S]*?)\);/g;
let match;
while ((match = regex.exec(app)) !== null) {
  console.log(match[0]);
}

