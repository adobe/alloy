const fs = require("fs");
const pm2 = require("pm2-deploy");

const ref = process.env.GITHUB_REF;

if (!ref || !ref.startsWith("refs/heads")) {
  console.error(`GITHUB_REF is a required env var and must start with refs/heads, got ${ref}`);
  process.exit(1);
}
const branch = ref.substring("refs/heads".length);
const path = `/var/www/${branch}.alloyio.com`;

const deployConfig = {
  "deploy": {
    "prod": {
      "user": "jonsnyder",
      "host": ["localhost"],
      ref,
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




