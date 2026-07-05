const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("                            })\n                          </div>", "                            })}\n                          </div>");
code = code.replace("                      );\n                    })}\n                  )}", "                      );\n                    })\n                  )}");

fs.writeFileSync('src/App.tsx', code);
