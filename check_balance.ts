import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fragmentStart = code.indexOf('{currentFoodDetail && (');
const fragmentEnd = code.indexOf('</>', fragmentStart);

if (fragmentStart !== -1 && fragmentEnd !== -1) {
  let fragment = code.substring(fragmentStart, fragmentEnd);
  const openTags = (fragment.match(/<[a-zA-Z]+/g) || []).filter(t => !t.startsWith('</'));
  const closeTags = (fragment.match(/<\/[a-zA-Z]+/g) || []);
  const selfClose = (fragment.match(/<[a-zA-Z][^>]*\/>/g) || []);
  
  console.log('Open tags:', openTags.length);
  console.log('Close tags:', closeTags.length);
  console.log('Self close:', selfClose.length);

  // let's do a stack based check
  let stack = [];
  const tagRegex = /<\/?[a-zA-Z]+[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(fragment)) !== null) {
    const tag = match[0];
    if (tag.endsWith('/>')) continue;
    if (tag.startsWith('</')) {
      const name = tag.match(/<\/([a-zA-Z]+)/)[1];
      if (stack.length > 0 && stack[stack.length - 1] === name) {
        stack.pop();
      } else {
        console.log("Unmatched close tag:", tag, "at index", match.index, "expected", stack[stack.length - 1]);
      }
    } else {
      const name = tag.match(/<([a-zA-Z]+)/)[1];
      stack.push(name);
    }
  }
  console.log("Remaining open tags:", stack);
}
