import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

export const getFilename = (root = import.meta.url) => fileURLToPath(root);
export const getDirname = (root = import.meta.url) =>
  path.dirname(getFilename(root));

export const getBrowserPackageRoot = () => {
  const dirname = getDirname(import.meta.url);
  return path.resolve(dirname, "..", "..");
};

export const getProjectRoot = () => {
  if (process.env.npm_config_cwd) {
    return process.env.npm_config_cwd;
  }

  const browserPackageRoot = getBrowserPackageRoot();
  const monorepoRoot = path.resolve(browserPackageRoot, "..", "..");

  if (fs.existsSync(path.join(monorepoRoot, "packages", "browser"))) {
    return monorepoRoot;
  }

  return browserPackageRoot;
};

export const safePathJoin = (...args) => {
  const joined = path.normalize(path.join(...args));
  const absolute = path.resolve(joined);
  if (!absolute.startsWith(getProjectRoot())) {
    throw new Error(`Path must be within project root: ${absolute}`);
  }
  return absolute;
};
