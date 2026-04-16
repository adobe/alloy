/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { OBJECT_ANALYTICS, OBJECT_JSON } from "../constants/schemaType";
import { solutionsContext } from "../../../dataElements/variable/components/dataVariable";

export default (solutions) => ({
  type: "object",
  properties: {
    data: {
      title: "Data",
      type: "object",
      properties: {
        __adobe: {
          title: "Adobe",
          type: "object",
          properties: solutions.reduce((accumulator, solutionKey) => {
            // Temporary support for 'audienceManager' property that should have been lowercased.
            const solutionKeyLower = solutionKey.toLowerCase();
            accumulator[solutionKeyLower] = {
              type:
                solutionKeyLower === "analytics"
                  ? OBJECT_ANALYTICS
                  : OBJECT_JSON,
              expandPaths: false,
              title: solutionsContext.find(
                ([solution]) => solutionKeyLower === solution,
              )[1],
            };
            return accumulator;
          }, {}),
        },
      },
    },
  },
});
