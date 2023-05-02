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
import validateSetConsentOptions from "../../../../../src/components/Privacy/validateSetConsentOptions";
import describeValidation from "../../../helpers/describeValidation";

const validGeneralConsent = [
  { standard: "Adobe", version: "1.0", value: { general: "in" } }
];

describeValidation(
  "Privacy:validateSetConsentOptions",
  validateSetConsentOptions,
  [
    {
      value: {
        consent: [
          { standard: "Adobe", version: "1.0", value: { general: "in" } }
        ]
      }
    },
    { value: { consent: [] }, error: true },
    { value: { consent: null }, error: true },
    { value: { consent: undefined }, error: true },
    { value: "in", error: true },
    { value: undefined, error: true },
    { value: null, error: true },
    {
      value: {
        consent: [
          {
            standard: "IAB",
            version: "2.0",
            value: "1234abcd",
            gdprApplies: true
          }
        ]
      }
    },
    {
      value: {
        consent: [
          {
            standard: "IAB",
            version: "2.0",
            value: "1234abcd",
            gdprApplies: true
          },
          { standard: "Adobe", version: "1.0", value: { general: "in" } }
        ]
      }
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: {
          HYP: [{}]
        }
      }
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: {
          HYP: [
            {
              id: "1234",
              authenticatedState: "ambiguous"
            }
          ]
        }
      }
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: {
          HYP: [
            {
              blah: "1234"
            }
          ]
        }
      },
      error: true
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: []
      },
      error: true
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: {
          email: []
        }
      }
    },
    {
      value: {
        consent: validGeneralConsent,
        identityMap: {
          email: [[]]
        }
      },
      error: true
    },
    {
      value: {
        consent: validGeneralConsent,
        edgeConfigOverrides: {
          identity: {
            idSyncContainerId: "123"
          }
        }
      }
    },
    { value: { consent: validGeneralConsent, edgeConfigOverrides: {} } }
  ]
);
