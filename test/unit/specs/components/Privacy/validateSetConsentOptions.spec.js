import validateSetConsentOptions from "../../../../../src/components/Privacy/validateSetConsentOptions";
import describeValidation from "../../../helpers/describeValidation";

describeValidation(
  "Privacy:validateSetConsentOptions",
  validateSetConsentOptions,
  [
    {
      value: {
        preferences: [
          { standard: "Adobe", version: "1.0", value: { general: "in" } }
        ]
      }
    },
    {
      value: {
        preferences: [
          { standard: "Adobe", version: "1.0", value: { general: "out" } }
        ]
      }
    },
    {
      value: {
        preferences: [
          { standard: "Adobe", version: "1.0", value: { foo: "in" } }
        ]
      },
      error: true
    },
    {
      value: {
        preferences: [
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
        preferences: [
          { standard: "Mine", version: "1.0", value: { general: "in" } }
        ]
      },
      error: true
    },
    {
      value: { preferences: [{ version: "1.0", value: { general: "in" } }] },
      error: true
    },
    {
      value: {
        preferences: [
          { standard: "Adobe", version: "2.0", value: { general: "in" } }
        ]
      },
      error: true
    },
    {
      value: { preferences: [{ standard: "Adobe", value: { general: "in" } }] },
      error: true
    },
    {
      value: { preferences: [{ standard: "Adobe", version: "1.0" }] },
      error: true
    },
    { value: { preferences: [] }, error: true },
    { value: { preferences: null }, error: true },
    { value: { preferences: undefined }, error: true },
    { value: "in", error: true },
    { value: undefined, error: true },
    { value: null, error: true }
  ]
);
