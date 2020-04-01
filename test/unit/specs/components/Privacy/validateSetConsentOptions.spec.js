import validateSetConsentOptions from "../../../../../src/components/Privacy/validateSetConsentOptions";
import describeValidation from "../../../helpers/describeValidation";

describeValidation(
  "Privacy:validateSetConsentOptions",
  validateSetConsentOptions,
  [
    { value: { general: "in" } },
    { value: { general: "out" } },
    { value: { foo: "in" }, error: true },
    { value: { general: "foo" }, error: true },
    { value: { general: "in", foo: "in" }, error: true },
    { value: {}, error: true },
    { value: "in", error: true },
    { value: undefined, error: true },
    { value: null, error: true }
  ]
);
