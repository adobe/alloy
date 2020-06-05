import validateSetConsentOptions from "../../../../../src/components/Privacy/validateSetConsentOptions";
import describeValidation from "../../../helpers/describeValidation";

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
    {
      value: {
        consent: [
          { standard: "Adobe", version: "1.0", value: { general: "out" } }
        ]
      }
    },
    {
      value: {
        consent: [{ standard: "Adobe", version: "1.0", value: { foo: "in" } }]
      },
      error: true
    },
    {
      value: {
        consent: [
          {
            standard: "Adobe",
            version: "1.0",
            value: { general: "in", foo: "in" }
          }
        ]
      },
      error: true
    },
    {
      value: {
        consent: [
          { standard: "Mine", version: "1.0", value: { general: "in" } }
        ]
      },
      error: true
    },
    {
      value: { consent: [{ version: "1.0", value: { general: "in" } }] },
      error: true
    },
    {
      value: {
        consent: [
          { standard: "Adobe", version: "2.0", value: { general: "in" } }
        ]
      },
      error: true
    },
    {
      value: { consent: [{ standard: "Adobe", value: { general: "in" } }] },
      error: true
    },
    {
      value: { consent: [{ standard: "Adobe", version: "1.0" }] },
      error: true
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
        consent: [{ standard: "IAB", value: "1234abcd", gdprApplies: true }]
      },
      error: true
    },
    {
      value: {
        consent: [{ standard: "IAB", version: "2.0", gdprApplies: true }]
      },
      error: true
    },
    {
      value: {
        consent: [{ standard: "IAB", version: "2.0", value: "1234abcd" }]
      },
      error: true
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
    }
  ]
);
