const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const scanBillEnrichmentStart = "// Fetch nutritional data for items from Open Food Facts";
const scanBillEnrichmentEnd = "res.json(result);";

if (code.includes(scanBillEnrichmentStart) && code.includes(scanBillEnrichmentEnd)) {
  const startIndex = code.indexOf(scanBillEnrichmentStart);
  const endIndex = code.indexOf(scanBillEnrichmentEnd);
  
  const replacement = `
      // We no longer pre-fetch all items here to prevent timeouts and save data.
      // The client will fetch them individually when clicked.
      result.score = 50; // default
      result.positives = ["Scan complete. Click items to analyze."];
      result.negatives = [];
      `;
      
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('server.ts', code);
} else {
  console.log("Could not find the block in server.ts");
}
