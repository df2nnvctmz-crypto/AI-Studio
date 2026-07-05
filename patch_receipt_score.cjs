const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldReceiptRenderTop = `                  ) : (
                    receipts.map((receipt) => {
                      const rDate = new Date(receipt.date);
                      const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const isExpanded = expandedBillId === receipt.id;
                      
                      return (
                      <div key={receipt.id} className="bg-white rounded-[1.25rem] border border-[#E5EAE3] shadow-sm overflow-hidden transition-all duration-300">`;

const newReceiptRenderTop = `                  ) : (
                    receipts.map((receipt) => {
                      const rDate = new Date(receipt.date);
                      const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const isExpanded = expandedBillId === receipt.id;
                      
                      let calculatedScore = receipt.score;
                      if (receipt.items && receipt.items.length > 0) {
                        let total = 0;
                        let count = 0;
                        receipt.items.forEach((it: any) => {
                          const df = dynamicFoods.find(f => f.id === it.id) || it.foodData;
                          if (df) {
                            total += df.healthScore;
                            count++;
                          }
                        });
                        if (count > 0) calculatedScore = Math.round(total / count);
                      }
                      
                      return (
                      <div key={receipt.id} className="bg-white rounded-[1.25rem] border border-[#E5EAE3] shadow-sm overflow-hidden transition-all duration-300">`;

code = code.replace(oldReceiptRenderTop, newReceiptRenderTop);

// Replace {receipt.score} with {calculatedScore}
code = code.replace(
  `                            <div className="w-10 h-10 rounded-full bg-[#EAF3EB] text-[#2F7E41] font-bold text-[13px] flex items-center justify-center">
                              {receipt.score}
                              <span className="text-[9px] font-medium ml-0.5 mt-0.5">%</span>`,
  `                            <div className="w-10 h-10 rounded-full bg-[#EAF3EB] text-[#2F7E41] font-bold text-[13px] flex items-center justify-center">
                              {calculatedScore}
                              <span className="text-[9px] font-medium ml-0.5 mt-0.5">%</span>`
);

fs.writeFileSync('src/App.tsx', code);
