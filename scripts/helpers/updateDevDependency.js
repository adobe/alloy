
const updateDevDependency = async ({
  exec,
  execSync,
  githubRef,
  logger,
  version
}) => {
  const { dependencies: { ["@adobe/alloy"]: { version: installedVersion } } } =
    JSON.parse(execSync(`npm ls @adobe/alloy --json`));
  if (installedVersion === version) {
    logger.warn(`Dependency @adobe/alloy@${version} already installed.`);
  } else {
    logger.info(`Installing @adobe/alloy@${version} as a dev dependency.`);
    await exec("npm install", `npm install @adobe/alloy@${version} --save-dev`);
    await exec("git add", `git add package.json package-lock.json`);
    await exec("git commit", `git commit -m "[skip ci] update self devDependency to ${version}"`);
    await exec("git push", `git push gh-origin HEAD:${githubRef}`);
  }
};

module.exports = updateDevDependency;
