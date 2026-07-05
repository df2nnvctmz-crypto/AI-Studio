import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

const fragmentStart = app.indexOf('{currentFoodDetail && (');
const fragmentEnd = app.indexOf('{/* Global Loading Overlay */}');

if (fragmentStart !== -1 && fragmentEnd !== -1) {
  const fragmentCode = app.substring(fragmentStart, fragmentEnd);
  const openDivs = (fragmentCode.match(/<div/g) || []).length;
  const closeDivs = (fragmentCode.match(/<\/div>/g) || []).length;
  console.log(`Open divs: ${openDivs}`);
  console.log(`Close divs: ${closeDivs}`);
} else {
  console.log("Could not find fragment bounds");
}
