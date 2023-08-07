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
import RulesEngine from "@adobe/aep-rules-engine";
import {
  JSON_CONTENT_ITEM,
  JSON_RULESET_ITEM
} from "../Personalization/constants/schema";
import flattenArray from "../../utils/flattenArray";
import createConsequenceAdapter from "./createConsequenceAdapter";

const isJsonRulesetItem = item => {
  const { schema, data } = item;

  if (schema === JSON_RULESET_ITEM) {
    return true;
  }

  if (schema !== JSON_CONTENT_ITEM) {
    return false;
  }

  const content =
    typeof data.content === "string" ? JSON.parse(data.content) : data.content;

  return (
    content &&
    Object.prototype.hasOwnProperty.call(content, "version") &&
    Object.prototype.hasOwnProperty.call(content, "rules")
  );
};

export default payload => {
  const consequenceAdapter = createConsequenceAdapter();
  const items = [];

  const addItem = item => {
    const { data = {} } = item;
    const { content } = data;

    if (!content) {
      return;
    }

    items.push(
      RulesEngine(typeof content === "string" ? JSON.parse(content) : content)
    );
  };

  const evaluate = context => {
    return {
      ...payload,
      items: flattenArray(items.map(item => item.execute(context))).map(
        consequenceAdapter
      )
    };
  };

  if (Array.isArray(payload.items)) {
    payload.items.filter(isJsonRulesetItem).forEach(addItem);
  }

  return {
    evaluate,
    isEvaluable: items.length > 0
  };
};
