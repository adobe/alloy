
const run = (getPort, namePrefix) => ({
  apps: [
    {
      name: `${namePrefix}personalization-hybrid`,
      cwd: "./personalization-hybrid",
      script: "./src/server.js",
      env: {
        PORT: getPort()
      }
    },
    {
      name: `${namePrefix}personalization-hybrid-spa`,
      cwd: "./personalization-hybrid-spa",
      script: "./server/src/server.js",
      env: {
        PORT: getPort()
      }
    },
    {
      name: `${namePrefix}personalization-server-side`,
      cwd: "./personalization-server-side",
      script: "./src/server.js",
      env: {
        PORT: getPort()
      }
    }
  ]
});

if (require.main === module) {
  let port = 3000;
  const getPort = () => {
    port += 1;
    return port;
  };
  const config = JSON.stringify(run(getPort, ""), null, 2);
  console.log(`module.exports = ${config};`);
}

module.exports = run;
