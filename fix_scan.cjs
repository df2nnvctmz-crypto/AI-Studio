const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const fileInputRef = useRef<HTMLInputElement>(null);",
  "const fileInputRef = useRef<HTMLInputElement>(null);\n  const fileInputLibRef = useRef<HTMLInputElement>(null);"
);

code = code.replace(
  "onClick={() => fileInputRef.current?.click()}",
  "onClick={() => fileInputRef.current?.click()}"
);

// We need to replace the SECOND onClick
const splitted = code.split("onClick={() => fileInputRef.current?.click()}");
if (splitted.length > 2) {
   code = splitted[0] + "onClick={() => fileInputRef.current?.click()}" + splitted[1] + "onClick={() => fileInputLibRef.current?.click()}" + splitted[2];
   if (splitted.length > 3) {
      code = code.replace(/onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/g, "onClick={() => fileInputRef.current?.click()}");
      // Actually we should just target the specific lines.
   }
}

// Add the second input right below the first
const inputHtml = `<input 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleScanBill} 
        />`;
const libInputHtml = `<input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputLibRef} 
          onChange={handleScanBill} 
        />`;

code = code.replace(inputHtml, inputHtml + "\n        " + libInputHtml);

fs.writeFileSync('src/App.tsx', code);
