import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

export const getFilename = (root = import.meta.url) => fileURLToPath(root);
export const getDirname = (root = import.meta.url) =>
  path.dirname(getFilename(root));
export const getProjectRoot = () => {
  // Attempt to detect the repository root by asking Git. This works even when
  // the script is executed from a workspace directory because `git` resolves
  // paths relative to the working directory automatically.
  try {
    // Using execSync keeps this zero-dependency and avoids extra async code.
    // We trim to remove the trailing newline that git appends.
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();
    if (gitRoot) {
      return gitRoot;
    }
  } catch {
    // Fall through to the legacy heuristics below.
  }

  // Fallback: use npm_config_workspace_root if available (npm >= 7.1.0)
  if (process.env.npm_config_workspace_root) {
    return process.env.npm_config_workspace_root;
  }

  // Another fallback: npm_config_cwd for older npm or non-workspace runs.
  if (process.env.npm_config_cwd) {
    return process.env.npm_config_cwd;
  }

  // Finally, resolve relative to this helper file (../../../../ to repo root)
  const dirname = getDirname(import.meta.url);
  return path.resolve(dirname, "../../../../");
};

export const safePathJoin = (...args) => {
  const joined = path.normalize(path.join(...args));
  const absolute = path.resolve(joined);
  if (!absolute.startsWith(getProjectRoot())) {
    throw new Error(`Path must be within project root: ${absolute}`);
  }
  return absolute;
};
