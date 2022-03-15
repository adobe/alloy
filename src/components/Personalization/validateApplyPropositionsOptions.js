import {
  anything,
  boolean,
  string,
  objectOf,
  arrayOf
} from "../../utils/validation";

export default objectOf({
  propositions: arrayOf(
    objectOf({
      renderAttempted: boolean(),
      id: string(),
      scope: string(),
      items: arrayOf(
        objectOf({
          id: string(),
          schema: string(),
          meta: objectOf({
            "experience.id": string(),
            "activity.id": string(),
            "offer.name": string(),
            "activity.name": string(),
            "offer.id": string()
          }),
          data: objectOf({
            type: string(),
            format: string(),
            content: string(),
            selector: string(),
            prehidingSelector: string()
          })
        })
      ),
      scopeDetails: objectOf(anything())
    })
  ).nonEmpty(),
  viewName: string()
}).required();
