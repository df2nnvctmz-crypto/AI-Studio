const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(swapsFavoritesOnly && !favoriteFoodIds\.includes\(swap\.fromId\) && !favoriteFoodIds\.includes\(swap\.toId\)\) return false;/g,
  'if (swapsFavoritesOnly && !favoriteSwapIds.includes(`${swap.fromId}::${swap.toId}`)) return false;'
);

fs.writeFileSync('src/App.tsx', code);
