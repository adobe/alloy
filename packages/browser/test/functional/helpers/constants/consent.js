/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const CONSENT_IN = {
  consent: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: "in",
      },
    },
  ],
};
export const CONSENT_OUT = {
  consent: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: "out",
      },
    },
  ],
};

export const IAB_CONSENT_IN = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
    },
  ],
};

export const IAB_CONSENT_IN_PERSONAL_DATA = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
      gdprContainsPersonalData: true,
    },
  ],
};

export const IAB_CONSENT_IN_NO_GDPR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: false,
    },
  ],
};

export const IAB_NO_PURPOSE_ONE = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
    },
  ],
};

export const IAB_NO_PURPOSE_ONE_NO_GRPR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
      gdprApplies: false,
    },
  ],
};

export const IAB_NO_PURPOSE_TEN = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052kIO052kIDGAMBFRACBgAIAAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
    },
  ],
};

export const IAB_NO_ADOBE_VENDOR = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052qdO052qdDGAMBFRACBgAIBAAAAAAIYgAAoAAAAA",
      gdprApplies: true,
    },
  ],
};

export const ADOBE2_IN = {
  consent: [
    {
      standard: "Adobe",
      version: "2.0",
      value: {
        collect: {
          val: "y",
        },
        metadata: {
          time: "2019-01-01T15:52:25+00:00",
        },
      },
    },
  ],
};

export const ADOBE2_OUT = {
  consent: [
    {
      standard: "Adobe",
      version: "2.0",
      value: {
        collect: {
          val: "n",
        },
        metadata: {
          time: "2019-01-01T15:52:25+00:00",
        },
      },
    },
  ],
};
