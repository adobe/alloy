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
  "deploy": {
    "prod": {
      "user": "jonsnyder",
      "host": ["localhost"],
      ref: `refs/heads/${branch}`,
      "repo": "git@github.com:adobe/alloy.git",
      path,
      "post-deploy": "./install.sh"
    }
  }
};

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

(async ()=>{

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    await deploy(["setup"]);
  }

  // deploy via PM2
  await deploy([]);

  // start servers
  await deploy(["exec", "pm2 start"]);

})();


