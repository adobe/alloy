import RulesEngine from "@adobe/aep-rules-engine";
import { JSON_RULESET_ITEM } from "../Personalization/constants/schema";
import flattenArray from "../../utils/flattenArray";

export default payload => {
  const items = [];

  const addItem = item => {
    const { data = {} } = item;
    const { content } = data;

    if (!content) {
      return;
    }

    items.push(RulesEngine(JSON.parse(content)));
  };

  const evaluate = context => {
    return {
      ...payload,
      items: flattenArray(items.map(item => item.execute(context))).map(
        item => item.detail
      )
    };
  };

  if (Array.isArray(payload.items)) {
    payload.items
      .filter(item => item.schema === JSON_RULESET_ITEM)
      .forEach(addItem);
  }

  return {
    evaluate,
    isEvaluable: items.length > 0
  };
};
