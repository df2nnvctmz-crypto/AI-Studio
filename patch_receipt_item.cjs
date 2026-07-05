const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldReceiptItemRender = `                            {receipt.items.map((item: any, idx: number) => {
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
                                 }}`;

const newReceiptItemRender = `                            {receipt.items.map((item: any, idx: number) => {
                               const dynFood = dynamicFoods.find(f => f.id === item.id) || item.foodData;
                               const score = dynFood?.healthScore || 50;
                               return (
                               <div 
                                 key={idx}
                                 onClick={() => {
                                   if (dynFood) {
                                     triggerHaptic();
                                     setSelectedFoodId(dynFood.id);
                                     if (!FOODS.find(f => f.id === dynFood.id)) {
                                       FOODS.push(dynFood);
                                     }
                                   } else {
                                     handleOpenDynamicFood(item);
                                   }
                                 }}`;

code = code.replace(oldReceiptItemRender, newReceiptItemRender);

fs.writeFileSync('src/App.tsx', code);
