const updatePackage = async ({
  currentVersion,
  exec,
  githubRef,
  logger,
  version
}) => {
  if (currentVersion === version) {
    logger.warn(`Version in package.json is already ${version}.`);
  } else {
    logger.info(`Updating package.json with version ${version}.`);
    await exec("npm version", `npm version ${version} --git-tag-version=false`);
    await exec("git add", "git add package.json package-lock.json");
    await exec("git commit", `git commit -m "[skip ci] ${version}"`);
    await exec("git push", `git push gh-origin HEAD:${githubRef}`);
  }
};

module.exports = updatePackage;
