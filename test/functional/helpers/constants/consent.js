export const CONSENT_IN = {
  consent: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: "in"
      }
    }
  ]
};
export const CONSENT_OUT = {
  consent: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: "out"
      }
    }
  ]
};

// TODO: Add a test case with no `gdprApplies`
export const IAB_CONSENT_IN = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true
    }
  ]
};

export const IAB_NO_PURPOSE_ONE = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true
    }
  ]
};

export const IAB_NO_PURPOSE_TEN = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052kIO052kIDGAMBFRACBgAIAAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true
    }
  ]
};

export const IAB_NO_ADOBE_VENDOR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052qdO052qdDGAMBFRACBgAIBAAAAAAIYgAAoAAAAA",
      gdprApplies: true
    }
  ]
};
