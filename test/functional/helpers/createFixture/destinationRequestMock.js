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

import { RequestMock } from "testcafe";

// The main edge configuration we're using for testing
// has URL destinations enabled and a URL destination handle is sent
// back as part of the response from each interact endpoint request.
// So that we're not relying on a third-party server for the URL
// destination to successfully execute, we'll mock the third-party
// URL destination endpoint.
export default RequestMock()
  .onRequestTo("https://cataas.com/cat")
  .respond(null, 200);
