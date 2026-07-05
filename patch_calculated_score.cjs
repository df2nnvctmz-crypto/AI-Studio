const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `                    receipts.map((receipt) => {
                      const rDate = new Date(receipt.date);
                      const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const isExpanded = expandedBillId === receipt.id;
                      
                      return (`;

const newStr = `                    receipts.map((receipt) => {
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
                      
                      return (`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/App.tsx', code);
