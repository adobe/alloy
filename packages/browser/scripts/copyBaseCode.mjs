import { cpSync } from "node:fs";

for (const ext of ["js", "d.ts"]) {
  cpSync(`src/baseCode/index.${ext}`, `dist/baseCode/index.${ext}`);
}
