const semver = require("semver");

const publishVersionBranch = async ({ exec, execSync, logger, version }) => {
  if (semver.prerelease(version) !== null) {
    logger.info("No need to create a test branch for a prerelease version.");
    return;
  }

  const publishedBranchData = execSync(
    `git ls-remote gh-origin refs/heads/v${version}`,
  ).toString();
  if (publishedBranchData !== "") {
    logger.warn(`Git branch v${version} already published.`);
  } else {
    logger.info(`Publishing Git branch v${version}.`);
    await exec("git branch", `git branch "v${version}"`);
    await exec("git push", `git push gh-origin HEAD:refs/heads/v${version}`);
  }
};

module.exports = publishVersionBranch;
