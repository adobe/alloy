const fs = require("fs");
const pm2 = require("pm2-deploy");

const branch = process.env.GITHUB_REF_NAME;

if (!branch) {
  console.error(`GITHUB_REF_NAME is a required env var, got ${ref}`);
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

if (!fs.existsSync(path)) {
  fs.mkdirSync(path);
  pm2.deployForEnv(deployConfig, "prod", ["setup"]);
}

// deploy via PM2
pm2.deployForEnv(deployConfig, "prod", []);

// start servers
pm2.deployForEnv(deployConfig, "prod", ["exec", "pm2 start"])




