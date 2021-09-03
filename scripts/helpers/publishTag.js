const publishTag = async ({ exec, execSync, logger, version }) => {
  const publishedTagData = execSync(
    `npm ls-remote gh-origin v${version}`
  ).toString();
  if (publishedTagData !== "") {
    logger.warn(`Git tag v${version} already published.`);
  } else {
    logger.info(`Publishing Git tag v${version}.`);
    await exec("git tag", `git tag -a "v${version}" -m "${version}"`);
    await exec("git push", `git push gh-origin v${version}`);
  }
};

module.exports = publishTag;
