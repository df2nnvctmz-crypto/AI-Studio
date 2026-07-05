import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove NOVA badge in spotlight
app = app.replace(/<div className="pt-1">\s*<span className="inline-block bg-\[#EAF3EB\] text-\[#2F7E41\] text-\[10px\] font-bold px-2 py-0\.5 rounded uppercase tracking-wide">\s*\{getNutriGradeDetails\(spotlightFood\.nutri_grade\)\.label\}\s*<\/span>\s*<\/div>/, '');

// 2. Remove description text
app = app.replace(/<p className="text-\[13px\] text-neutral-600 mt-4 leading-relaxed text-left">\s*\{language === "en"\s*\?\s*"An exceptional whole food rich in heart-healthy fats and nearly 20 essential nutrients\."\s*:\s*"Ein außergewöhnliches Naturprodukt, reich an herzgesunden Fetten und fast 20 essenziellen Nährstoffen\."\}\s*<\/p>/, '');

// 3. Fix bindings in spotlight
app = app.replace(/{spotlightFood\.calories}/g, '{spotlightFood.nutrients_per_100.kcal}');
app = app.replace(/{spotlightFood\.nutrients_per_100\.protein}g/g, '{spotlightFood.nutrients_per_100.protein_g}g');
app = app.replace(/{spotlightFood\.nutrients_per_100\.fiber}g/g, '{spotlightFood.nutrients_per_100.fiber_g}g');
app = app.replace(/{food\.calories} kcal/g, '{food.nutrients_per_100.kcal} kcal');

// 4. Remove Serving from spotlight
const spotlightServing = `<div className="w-px h-8 bg-[#E5EAE3]" />
                  <div className="text-center flex-[1.5]">
                    <p className="text-sm font-bold text-neutral-900">"100g"</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{t("serving")}</p>
                  </div>`;
app = app.replace(spotlightServing, '');

fs.writeFileSync('src/App.tsx', app);
