import fs from 'fs';

let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/export \{ Food \} from "\.\/data";/, 'export type { Food } from "./data";\nimport { Food } from "./data";');
fs.writeFileSync('src/types.ts', types);

