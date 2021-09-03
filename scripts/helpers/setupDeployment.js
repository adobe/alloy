const setupDeployment = async ({
  exec,
  githubActor,
  githubRepository,
  logger,
  npmToken
}) => {
  logger.info("Configuring git.");
  await exec("git config", `git config user.name ${githubActor}`);
  await exec(
    "git config",
    `git config user.email gh-actions-${githubActor}@github.com`
  );
  await exec(
    "git remote add",
    `git remote add gh-origin git@github.com:${githubRepository}.git`
  );
  logger.info("Configuring NPM.");
  await exec(
    "npm config",
    `npm config set //registry.npmjs.org/:_authToken=${npmToken}`
  );
};

module.exports = setupDeployment;
