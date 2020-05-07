import orgMainConfigMain from "./orgMainConfigMain";
import orgAltConfigAlt from "./orgAltConfigAlt";
import debugEnabled from "./debugEnabled";
import debugDisabled from "./debugDisabled";
import edgeDomainFirstParty from "./edgeDomainFirstParty";
import edgeDomainThirdParty from "./edgeDomainThirdParty";
import migrationEnabled from "./migrationEnabled";
import migrationDisabled from "./migrationDisabled";
import consentIn from "./consentIn";
import consentPending from "./consentPending";
import thirdPartyCookiesEnabled from "./thirdPartyCookiesEnabled";
import thirdPartyCookiesDisabled from "./thirdPartyCookiesDisabled";

const compose = (...objects) => Object.assign({}, ...objects);

export {
  compose,
  orgMainConfigMain,
  orgAltConfigAlt,
  debugEnabled,
  debugDisabled,
  edgeDomainFirstParty,
  edgeDomainThirdParty,
  migrationEnabled,
  migrationDisabled,
  consentIn,
  consentPending,
  thirdPartyCookiesEnabled,
  thirdPartyCookiesDisabled
};
