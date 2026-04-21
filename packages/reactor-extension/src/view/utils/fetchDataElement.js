/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fetchFromReactor from "./fetchFromReactor";
import UserReportableError from "../errors/userReportableError";

const fetchDataElement = async ({ orgId, imsAccess, dataElementId }) => {
  let parsedResponse;
  try {
    parsedResponse = await fetchFromReactor({
      orgId,
      imsAccess,
      path: `/data_elements/${dataElementId}`,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError("Failed to load data element.", {
      originatingError: e,
    });
  }

  const {
    id,
    attributes: { name, settings },
  } = parsedResponse.parsedBody.data;
  return { id, name, settings: JSON.parse(settings) };
};

export default fetchDataElement;
