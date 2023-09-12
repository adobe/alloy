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
import { REDIRECT_ITEM } from "../constants/schema";
import { find } from "../../../utils";

export default ({ next }) => proposition => {
  const { items = [] } = proposition.getHandle() || {};

  const redirectItem = find(items, ({ schema }) => schema === REDIRECT_ITEM);
  if (redirectItem) {
    const {
      data: { content }
    } = redirectItem;
    proposition.redirect(content);
    // On a redirect, nothing else needs to handle this.
  } else {
    next(proposition);
  }
};
