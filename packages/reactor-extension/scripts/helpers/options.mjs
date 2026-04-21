import minimist from "minimist";
import { fileURLToPath } from "url";
import path from "path";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const inputDir = path.join(__dirname, "../../src");
export const tempDir = path.join(__dirname, "../../temp");
export const outputDir = path.join(__dirname, "../../dist");

export const { watch } = minimist(process.argv.slice(2));
