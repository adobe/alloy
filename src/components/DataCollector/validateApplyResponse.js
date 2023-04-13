import {
  anything,
  arrayOf,
  boolean,
  mapOfValues,
  objectOf,
  string
} from "../../utils/validation";

export default ({ options }) => {
  const validator = objectOf({
    renderDecisions: boolean(),
    decisionContext: objectOf({}),
    responseHeaders: mapOfValues(string().required()),
    responseBody: objectOf({
      handle: arrayOf(
        objectOf({
          type: string().required(),
          payload: anything().required()
        })
      ).required()
    }).required()
  }).noUnknownFields();

  return validator(options);
};
