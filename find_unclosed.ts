import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fragmentStart = code.indexOf('{currentFoodDetail && (');
const fragmentEnd = code.indexOf('</>', fragmentStart);

let fragment = code.substring(fragmentStart, fragmentEnd);

// Strip all {/* ... */} comments
fragment = fragment.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
// Strip Record<...> to avoid false positives
fragment = fragment.replace(/Record<[^>]+>/g, '');

let stack = [];
const tagRegex = /<\/?([a-zA-Z]+)[^>]*>/g;
let match;
while ((match = tagRegex.exec(fragment)) !== null) {
  const fullTag = match[0];
  const isClosing = fullTag.startsWith('</');
  const isSelfClosing = fullTag.endsWith('/>');
  const tag = match[1];

  if (isSelfClosing) continue;

  if (isClosing) {
    if (stack.length > 0 && stack[stack.length - 1] === tag) {
      stack.pop();
    } else {
      console.log("Unmatched closing:", fullTag, "Expected:</" + stack[stack.length - 1] + ">");
    }
  } else {
    stack.push(tag);
  }
}
console.log("Remaining open tags:", stack);
