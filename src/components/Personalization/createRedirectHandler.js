/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const getRedirectDetails = redirectDecisions => {
  const decision = redirectDecisions[0];
  const { items, id, scope } = decision;
  const { content } = items[0].data;

  return { content, decisions: [{ id, scope }] };
};

export default ({ collect, win = window }) => {
  return redirectDecisions => {
    const { content, decisions } = getRedirectDetails(redirectDecisions);
    const documentMayUnload = true;

    return collect({ meta: { decisions } }, documentMayUnload).then(() => {
      win.location.replace(content);
    });
  };
};
