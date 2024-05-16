import createHandleConsentFlicker from "../../../../../src/components/Personalization/createHandleConsentFlicker";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Personalization::createHandleConsentFlicker", () => {
  let showContainers;
  let consent;
  let handleConsentFlicker;

  beforeEach(() => {
    showContainers = jasmine.createSpy("showContainers");
    consent = jasmine.createSpyObj("consent", ["current", "awaitConsent"]);
    handleConsentFlicker = createHandleConsentFlicker({
      showContainers,
      consent
    });
  });

  it("shows containers when consent is out and was set", () => {
    consent.current.and.returnValue({ state: "out", wasSet: true });
    handleConsentFlicker();
    expect(showContainers).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(consent.awaitConsent).not.toHaveBeenCalled();
    });
  });

  it("shows containers after consent is rejected", () => {
    consent.current.and.returnValue({ state: "out", wasSet: false });
    consent.awaitConsent.and.returnValue(Promise.reject());
    handleConsentFlicker();
    expect(consent.awaitConsent).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("does not show containers after consent is given", () => {
    consent.current.and.returnValue({ state: "out", wasSet: false });
    consent.awaitConsent.and.returnValue(Promise.resolve());
    handleConsentFlicker();
    expect(consent.awaitConsent).toHaveBeenCalled();
    flushPromiseChains().then(() => {
      expect(showContainers).not.toHaveBeenCalled();
    });
  });
});
