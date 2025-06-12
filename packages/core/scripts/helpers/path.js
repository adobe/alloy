import path from "path";
import process from "process";
import { fileURLToPath } from "url";

export const getFilename = (root = import.meta.url) => fileURLToPath(root);
export const getDirname = (root = import.meta.url) =>
  path.dirname(getFilename(root));
export const getProjectRoot = () => {
  if (process.env.npm_config_cwd) {
    return process.env.npm_config_cwd;
  }
  const dirname = getDirname(import.meta.url);
  return path.resolve(dirname, "../..");
};

export const safePathJoin = (...args) => {
  const joined = path.normalize(path.join(...args));
  const absolute = path.resolve(joined);
  if (!absolute.startsWith(getProjectRoot())) {
    throw new Error(`Path must be within project root: ${absolute}`);
  }
  return absolute;
};
