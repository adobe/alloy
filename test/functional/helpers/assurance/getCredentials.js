import chalk from "chalk";

export const IMS_URL = process.env["IMS_URL"] || "https://ims-na1.adobelogin.com";
// default to Unified JS QE Only org
export const ASSURANCE_ORG_ID = process.env["ASSURANCE_ORG_ID"] || "5BFE274A5F6980A50A495C08@AdobeOrg";
// default to "Alloy end to end testing" project
export const ASSURANCE_CLIENT_ID = process.env["ASSURANCE_CLIENT_ID"] || "0c1c7478c4994c69866b64c8341578ed";
// Use the Adobe developer console to get the client secret for the client ID above.
export const ASSURANCE_CLIENT_SECRET = process.env["ASSURANCE_CLIENT_SECRET"];
// Use the Adobe developer console to generate a JWT token for the client ID above.
export const ASSURANCE_JWT_TOKEN = process.env["ASSURANCE_JWT_TOKEN"];

if (!ASSURANCE_CLIENT_SECRET) {
  console.error(
    chalk.redBright(
      `Failed to read client secret. Please ensure the ASSURANCE_CLIENT_SECRET environment variable is set.`
    )
  );
}

if (!ASSURANCE_JWT_TOKEN) {
  console.error(
    chalk.redBright(
      `Failed to read JWT token. Please ensure the ASSURANCE_JWT_TOKEN environment variable is set.`
    )
  );
}

export default ({
  imsUrl: IMS_URL,
  clientId: ASSURANCE_CLIENT_ID,
  clientSecret: ASSURANCE_CLIENT_SECRET,
  jwtToken: ASSURANCE_JWT_TOKEN
});


