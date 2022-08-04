const ref = process.env.GITHUB_REF;

if (!ref || !ref.startsWith("/refs/heads")) {
  console.error("GITHUB_REF is a required env var and must start with /refs/heads");
  process.exit(1);
}

const deployConfig = {
  "deploy": {
    "prod": {
      "user": "josnyder",
      "host": ["localhost"],
      ref,
      "repo": "git@github.com:adobe/all.git",
      "path": "/Users/josnyder/dev/gw-sandbox-main",
      "post-deploy": "./intall.sh"
    }
  }
}


