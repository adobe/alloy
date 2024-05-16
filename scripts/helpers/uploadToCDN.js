import ApplicationError from "./applicationError.js";

const uploadToCDN = async ({ exec, logger, urlExists, version }) => {
  const ensureUrlResolves = async (url) => {
    if (!(await urlExists(url))) {
      throw new ApplicationError(`File not found on CDN: ${url}`);
    }
  };

  // We don't do a check here because there is no harm in re-building and re-uploading the files.

  logger.info("Building files for CDN");
  await exec("build", "npm run build");

  const ftpCommands = `-mkdir ${version}
cd ${version}
put ./dist/alloy.js
put ./dist/alloy.min.js
bye
`;
  logger.info("Uploading files to CDN.");
  await exec(
    "sftp",
    `echo "${ftpCommands}" | sftp -oHostKeyAlgorithms=+ssh-dss -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy`,
  );

  await ensureUrlResolves(
    `https://cdn1.adoberesources.net/alloy/${version}/alloy.js`,
  );
  await ensureUrlResolves(
    `https://cdn1.adoberesources.net/alloy/${version}/alloy.min.js`,
  );
};

export default uploadToCDN;
