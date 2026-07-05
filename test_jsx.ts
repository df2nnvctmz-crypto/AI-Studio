import fs from 'fs';
import * as ts from 'typescript';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const sourceFile = ts.createSourceFile('App.tsx', code, ts.ScriptTarget.Latest, true);

function printDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
  diagnostics.forEach(d => {
    if (d.file) {
      const pos = d.file.getLineAndCharacterOfPosition(d.start!);
      console.log(`Line ${pos.line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    }
  });
}

const program = ts.createProgram(['src/App.tsx'], { jsx: ts.JsxEmit.ReactJSX });
const diagnostics = ts.getPreEmitDiagnostics(program);
printDiagnostics(diagnostics);

