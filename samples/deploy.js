const fs = require("fs");
const pm2 = require("pm2-deploy");


const branch = process.env.BRANCH_NAME;

if (!branch) {
  console.error(`BRANCH_NAME is a required env var, got ${ref}`);
  process.exit(1);
}
const path = `/var/www/${branch}.alloyio.com`;
console.log(`Deploying to ${path}`);

const deployConfig = {
  "prod": {
    "user": "josnyder",
    "host": ["localhost"],
    ref: `origin/${branch}`,
    "repo": "git@github.com:adobe/alloy.git",
    path,
    "post-deploy": "cd samples && ./install.sh"
  }
};
console.log(JSON.stringify(deployConfig, null, 2));

const deploy = (args) => {
  console.log(`Running deploy with ${args.join(" ")}`);
  return new Promise((resolve, reject) => {
    pm2.deployForEnv(deployConfig, "prod", args, err => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        console.log('Success!');
        resolve()
      }
    });
  });
};

const run = async () => {

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    await deploy(["setup"]);
  } else {
    // deploy via PM2
    await deploy(["update", "--force"]);
  }

  // start servers
  await deploy(["exec", "cd samples && npm run init && npm run start"]);

};

(async () => {
  try {
    await run();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


