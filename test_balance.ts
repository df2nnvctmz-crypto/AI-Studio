import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fragmentStart = code.indexOf('{currentFoodDetail && (');
const fragmentEnd = code.indexOf('</>\n        )}', fragmentStart);

let fragment = code.substring(fragmentStart, fragmentEnd);
fragment = fragment.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
fragment = fragment.replace(/Record<[^>]+>/g, '');
fragment = fragment.replace(/<[a-zA-Z0-9]+[^>]*\/>/g, '');

let stack = [];
const tagRegex = /<\/?([a-zA-Z]+)[^>]*>/g;
let match;
while ((match = tagRegex.exec(fragment)) !== null) {
  const fullTag = match[0];
  const isSelfClosing = fullTag.endsWith('/>');
  const isClosing = fullTag.startsWith('</');
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
