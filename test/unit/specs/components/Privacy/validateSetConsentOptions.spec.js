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
      }
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
    }
  ]
);
