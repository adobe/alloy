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

import { RequestMock } from "testcafe";
import responseHeaders from "./responseHeaders.mjs";

const DATA_ELEMENTS_REGEX = /properties\/PRabcd\/data_elements/;
const DATA_ELEMENTS_FIRST_PAGE_REGEX =
  /properties\/PRabcd\/data_elements?.*page%5Bnumber%5D=1/;
const DATA_ELEMENTS_SECOND_PAGE_REGEX =
  /properties\/PRabcd\/data_elements?.*page%5Bnumber%5D=2/;

const testDataVariable1 = {
  id: "DE1",
  attributes: {
    name: "Test data variable 1",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.5",
      },
    }),
  },
};
const testDataVariable2 = {
  id: "DE2",
  attributes: {
    name: "Test data variable 2",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489",
        version: "1.1",
      },
    }),
  },
};
const otherDataElement1 = {
  id: "ODE1",
  attributes: {
    name: "Other data element 1",
    delegate_descriptor_id: "core::dataElements::constant",
    settings: '{"value":"aaaa"}',
  },
};
const testDataVariable3 = {
  id: "DE3",
  attributes: {
    name: "Test data variable 3",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "sch123",
        version: "1.0",
      },
    }),
  },
};
const testDataVariable4 = {
  id: "DE4",
  attributes: {
    name: "Test data variable 4",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "sch456",
        version: "1.0",
      },
    }),
  },
};
const testDataVariable5 = {
  id: "DE5",
  attributes: {
    name: "Test data variable 5",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "sch789",
        version: "1.0",
      },
    }),
  },
};
const testDataVariable6 = {
  id: "DE6",
  attributes: {
    name: "Test data variable 6",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      sandbox: {
        name: "prod",
      },
      schema: {
        id: "sch10",
        version: "1.0",
      },
    }),
  },
};
const testSolutionsVariable1 = {
  id: "SDE1",
  attributes: {
    name: "Test solutions variable 1",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      solutions: ["analytics", "target", "audiencemanager"],
    }),
  },
};
const testSolutionsVariable2 = {
  id: "SDE2",
  attributes: {
    name: "Test solutions variable 2",
    delegate_descriptor_id: "adobe-alloy::dataElements::variable",
    settings: JSON.stringify({
      solutions: ["target"],
    }),
  },
};

export const notFound = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_REGEX, method: "GET" })
  .respond({}, 404, responseHeaders);

export const single = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_REGEX, method: "GET" })
  .respond(
    {
      data: [otherDataElement1, testDataVariable1],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 2,
        },
      },
    },
    200,
    responseHeaders,
  );

export const none = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_FIRST_PAGE_REGEX, method: "GET" })
  .respond(
    {
      data: [otherDataElement1],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 1,
        },
      },
    },
    200,
    responseHeaders,
  );

export const noneWithNextPage = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_FIRST_PAGE_REGEX, method: "GET" })
  .respond(
    {
      data: [otherDataElement1],
      meta: {
        pagination: {
          current_page: 1,
          next_page: 2,
        },
      },
    },
    200,
    responseHeaders,
  );

export const secondPageWithOne = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_SECOND_PAGE_REGEX, method: "GET" })
  .respond(
    {
      data: [testDataVariable1],
      meta: {
        pagination: {
          current_page: 2,
          next_page: null,
        },
      },
    },
    200,
    responseHeaders,
  );

export const multiple = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_REGEX, method: "GET" })
  .respond(
    {
      data: [
        testDataVariable1,
        testDataVariable2,
        testDataVariable3,
        testDataVariable4,
        testDataVariable5,
        testDataVariable6,
      ],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
        },
      },
    },
    200,
    responseHeaders,
  );

export const singleSolutions = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_REGEX, method: "GET" })
  .respond(
    {
      data: [otherDataElement1, testSolutionsVariable1],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 2,
        },
      },
    },
    200,
    responseHeaders,
  );

export const multipleBothTypes = RequestMock()
  .onRequestTo({ url: DATA_ELEMENTS_REGEX, method: "GET" })
  .respond(
    {
      data: [
        testSolutionsVariable1,
        testSolutionsVariable2,
        testDataVariable1,
        testDataVariable2,
      ],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
        },
      },
    },
    200,
    responseHeaders,
  );
