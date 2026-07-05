import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// replace healthScore
app = app.replace(/healthScore/g, 'health_score');

// check getTranslatedFood inside App.tsx
// wait, maybe there's another getTranslatedFood
app = app.replace(/import \{ Receipt, ReceiptItem, Swap \}/g, 'import { Receipt, ReceiptItem }');

fs.writeFileSync('src/App.tsx', app);

