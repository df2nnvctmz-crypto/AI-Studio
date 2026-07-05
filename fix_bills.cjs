const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldBills = `                    receipts.map((receipt) => {
                      const rDate = new Date(receipt.date);
                      const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const totalPts = Math.round(receipt.score * 0.1); // Fake points calculation
                      
                      return (
                      <div
                        key={receipt.id}
                        className="bg-white rounded-2xl border border-[#E5EAE3] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#F7FBF6] border border-[#E5EAE3] flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5 text-neutral-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="font-bold text-neutral-900 text-[15px] truncate">
                            {receipt.storeName || "Unknown store"}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">
                            {fullDate} • {receipt.totalAmount || "EUR15.95"} • {receipt.items?.length || 0} matched
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#EAF3EB] text-[#2F7E41] font-bold text-[13px]">
                          +{totalPts}
                          <span className="text-[9px] font-medium ml-0.5 mt-0.5">pts</span>
                        </div>
                      </div>
                      );
                    })`;

const newBills = `                    receipts.map((receipt) => {
                      const rDate = new Date(receipt.date);
                      const fullDate = isNaN(rDate.getTime()) ? receipt.date : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const isExpanded = expandedBillId === receipt.id;
                      
                      return (
                      <div
                        key={receipt.id}
                        className="bg-white rounded-[1.25rem] border border-[#E5EAE3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden"
                      >
                        <div 
                           className="p-4 flex items-center gap-4 cursor-pointer"
                           onClick={() => {
                             triggerHaptic();
                             setExpandedBillId(isExpanded ? null : receipt.id);
                           }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#F7FBF6] border border-[#E5EAE3] flex items-center justify-center shrink-0">
                            <Receipt className="w-5 h-5 text-neutral-400" />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="font-bold text-neutral-900 text-[15px] truncate">
                              {receipt.storeName || "Unknown store"}
                            </h4>
                            <p className="text-xs text-neutral-400 truncate">
                              {fullDate} • {receipt.totalAmount || "EUR15.95"} • {receipt.items?.length || 0} items
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[#EAF3EB] text-[#2F7E41] font-bold text-[13px] flex items-center justify-center">
                              {receipt.score}
                              <span className="text-[9px] font-medium ml-0.5 mt-0.5">%</span>
                            </div>
                            <ChevronDown className={\`w-5 h-5 text-neutral-400 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
                          </div>
                        </div>

                        {isExpanded && receipt.items && receipt.items.length > 0 && (
                          <div className="border-t border-[#E5EAE3] p-4 bg-[#F7FBF6]/50 space-y-2">
                            {receipt.items.map((item: any, idx: number) => {
                               const score = item.foodData?.healthScore || 50;
                               return (
                               <div 
                                 key={idx}
                                 onClick={() => {
                                   if (item.foodData) {
                                     triggerHaptic();
                                     setSelectedFoodId(item.foodData.id);
                                     if (!FOODS.find(f => f.id === item.foodData.id)) {
                                       FOODS.push(item.foodData);
                                     }
                                   } else {
                                     handleOpenDynamicFood(item);
                                   }
                                 }}
                                 className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E5EAE3] cursor-pointer shadow-sm hover:border-[#CDE5CE] transition-colors"
                               >
                                 <div className="flex items-center gap-3">
                                   <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold \${score >= 75 ? 'bg-[#EAF3EB] text-[#2F7E41]' : score >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}\`}>
                                     {score}
                                   </div>
                                   <div className="flex flex-col">
                                     <span className="text-sm font-medium text-neutral-900">{item.cleanName}</span>
                                     <span className="text-[10px] text-neutral-400 truncate w-40">{item.rawName}</span>
                                   </div>
                                 </div>
                                 <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                               </div>
                               );
                            })}
                          </div>
                        )}
                      </div>
                      );
                    })`;

if (code.includes(oldBills)) {
  code = code.replace(oldBills, newBills);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success");
} else {
  console.log("Could not find oldBills snippet in App.tsx");
}
