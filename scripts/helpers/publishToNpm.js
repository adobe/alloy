const publishToNpm = async ({
  exec,
  execSync,
  logger,
  npmTag,
  version
}) => {

  const publishVersionJson = execSync(`npm view @adobe/alloy@${version} version --json`);
  if (publishVersionJson !== "") {
    logger.warn(`NPM already has version ${version}.`)
  } else {
    logger.info("Publishing NPM package.");
    await exec("npm publish", `npm publish -access public --tag ${npmTag}`);
  }
}

module.exports = publishToNpm;
