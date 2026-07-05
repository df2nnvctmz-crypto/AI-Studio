const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `                    <p className="text-xs text-neutral-400 font-medium pb-2 border-b border-[#F2F6F1]">
                      Per serving · {currentFoodDetail.servingSize}
                    </p>`;

const newStr = `                    <div className="flex justify-between items-center pb-2 border-b border-[#F2F6F1]">
                      <p className="text-xs text-neutral-400 font-medium">
                        Per serving · {currentFoodDetail.servingSize}
                      </p>
                      <p className="text-[10px] text-[#519D46] font-medium bg-[#EAF3EB] px-2 py-0.5 rounded-full">
                        Source: Open Food Facts
                      </p>
                    </div>`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/App.tsx', code);
