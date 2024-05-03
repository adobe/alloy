import handleConsentFlicker from "../../../../../src/components/Personalization/handleConsentFlicker";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Personalization::handleConsentFlicker", () => {
  let showContainers;
  let consent;

  beforeEach(() => {
    showContainers = jasmine.createSpy("showContainers");
    consent = jasmine.createSpyObj("consent", ["current", "awaitConsent"]);
  });

  it("shows containers when consent is out and was set", () => {
    consent.current.and.returnValue({ state: "out", wasSet: true });
    handleConsentFlicker({ showContainers, consent });
    expect(showContainers).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(consent.awaitConsent).not.toHaveBeenCalled();
    });
  });

  it("shows containers after consent is rejected", () => {
    consent.current.and.returnValue({ state: "out", wasSet: false });
    consent.awaitConsent.and.returnValue(Promise.reject());
    handleConsentFlicker({ showContainers, consent });
    expect(consent.awaitConsent).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("does not show containers after consent is given", () => {
    consent.current.and.returnValue({ state: "out", wasSet: false });
    consent.awaitConsent.and.returnValue(Promise.resolve());
    handleConsentFlicker({ showContainers, consent });
    expect(consent.awaitConsent).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(showContainers).not.toHaveBeenCalled();
    });
  });
});
