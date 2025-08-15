/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export default (data) => {
    const parsedData = JSON.parse(data);
    const { handle = [] } = parsedData;

  if (handle.length === 0) {
      return null;
    }

    const { payload = [] } = handle[0];

    if (payload.length === 0) {
      return null;
    }

    const { response = {}, state = "", conversationId, interactionId } = payload[0];

    if (Object.keys(response).length === 0) {
      return null;
    }

    const { message = "", promptSuggestions = [], multimodalElements = [], sources } = response;

    return { message, multimodalElements, promptSuggestions, state, sources, conversationId, interactionId };
};