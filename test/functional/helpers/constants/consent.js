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

export const IAB_CONSENT_IN_PERSONAL_DATA = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
      gdprContainsPersonalData: true
    }
  ]
};

export const IAB_CONSENT_IN_NO_GDPR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: false
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

export const IAB_NO_PURPOSE_ONE_NO_GRPR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
      gdprApplies: false
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

export const ADOBE2_IN = {
  consent: [
    {
      standard: "Adobe",
      version: "2.0",
      value: {
        collect: {
          val: "y"
        }
      }
    }
  ]
};

export const ADOBE2_OUT = {
  consent: [
    {
      standard: "Adobe",
      version: "2.0",
      value: {
        collect: {
          val: "n"
        }
      }
    }
  ]
};
