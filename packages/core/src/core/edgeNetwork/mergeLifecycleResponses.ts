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

import { assignConcatArrayValues } from "../../utils/index.js";

type LifecycleReturnValue = Record<string, unknown>;

export default (returnValues: unknown[]): Record<string, unknown> => {
  // Merges all returned objects from all `onResponse` callbacks into
  // a single object that can later be returned to the customer.
  // Callback aggregators resolve to unknown[]; these entries are arrays of objects or objects.
  const lifecycleOnResponseReturnValues = (returnValues.shift() ||
    []) as LifecycleReturnValue[];
  const consumerOnResponseReturnValues = (returnValues.shift() ||
    []) as LifecycleReturnValue[];
  const lifecycleOnBeforeRequestReturnValues =
    returnValues as LifecycleReturnValue[];

  return assignConcatArrayValues(
    {},
    ...lifecycleOnResponseReturnValues,
    ...consumerOnResponseReturnValues,
    ...lifecycleOnBeforeRequestReturnValues,
  );
};
