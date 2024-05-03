import { OUT } from "../../constants/consentStatus";

export default ({ showContainers, consent }) => {
  const { state, wasSet } = consent.current();
  if (state === OUT && wasSet) {
    showContainers();
  } else {
    consent.awaitConsent().catch(showContainers);
  }
};
