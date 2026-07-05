import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fragmentStart = code.indexOf('return (');
const fragmentEnd = code.lastIndexOf(');');

let fragment = code.substring(fragmentStart, fragmentEnd);
fragment = fragment.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
fragment = fragment.replace(/Record<[^>]+>/g, '');
fragment = fragment.replace(/<[A-Za-z0-9]+\s+[^>]*\/>/g, ''); // replace self closing
fragment = fragment.replace(/<[A-Za-z0-9]+\/>/g, ''); // replace self closing
fragment = fragment.replace(/<>/g, '');
fragment = fragment.replace(/<\/>/g, '');

let stack = [];
const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
let lastError = "";
while ((match = tagRegex.exec(fragment)) !== null) {
  const fullTag = match[0];
  if (fullTag.endsWith('/>')) continue;
  const isClosing = fullTag.startsWith('</');
  const tag = match[1];

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
