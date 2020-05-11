const createConsent = consent => ({
  preferences: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: consent
      }
    }
  ]
});

export const CONSENT_IN = createConsent("in");
export const CONSENT_OUT = createConsent("out");
