import orgMainConfigMain from "./orgMainConfigMain";
import orgAltConfigAlt from "./orgAltConfigAlt";
import debugEnabled from "./debugEnabled";
import debugDisabled from "./debugDisabled";
import edgeDomainFirstParty from "./edgeDomainFirstParty";
import edgeDomainThirdParty from "./edgeDomainThirdParty";
import migrationEnabled from "./migrationEnabled";
import migrationDisabled from "./migrationDisabled";
import errorsEnabled from "./errorsEnabled";
import errorsDisabled from "./errorsDisabled";
import consentIn from "./consentIn";
import consentPending from "./consentPending";

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
  errorsEnabled,
  errorsDisabled,
  consentIn,
  consentPending
};
