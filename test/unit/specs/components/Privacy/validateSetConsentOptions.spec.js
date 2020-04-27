import validateSetConsentOptions from "../../../../../src/components/Privacy/validateSetConsentOptions";
import describeValidation from "../../../helpers/describeValidation";

describeValidation(
  "Privacy:validateSetConsentOptions",
  validateSetConsentOptions,
  [
    { value: { purposes: { general: "in" } } },
    { value: { purposes: { general: "out" } } },
    { value: { purposes: { foo: "in" } }, error: true },
    { value: { purposes: { general: "foo" } }, error: true },
    { value: { purposes: { general: "in", foo: "in" } }, error: true },
    { value: { purposes: {} }, error: true },
    { value: { purposes: "in" }, error: true },
    { value: { purposes: undefined }, error: true },
    { value: { purposes: null }, error: true },
    { value: { foo: "bar" }, error: true },
    { value: {}, error: true },
    { value: "in", error: true },
    { value: undefined, error: true },
    { value: null, error: true }
  ]
);
