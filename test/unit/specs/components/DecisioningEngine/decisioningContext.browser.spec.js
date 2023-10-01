// /*
// Copyright 2023 Adobe. All rights reserved.
// This file is licensed to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may obtain a copy
// of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under
// the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
// OF ANY KIND, either express or implied. See the License for the specific language
// governing permissions and limitations under the License.
// */
// import {
//   mockWindow,
//   setupResponseHandler,
//   proposition
// } from "./contextTestUtils";
//
// describe("DecisioningEngine:globalContext:browser", () => {
//   let applyResponse;
//   beforeEach(() => {
//     applyResponse = jasmine.createSpy();
//   });
//   it("satisfies rule based on matched browser", () => {
//     setupResponseHandler(applyResponse, mockWindow({}), {
//       definition: {
//         key: "browser.name",
//         matcher: "eq",
//         values: ["chrome"]
//       },
//       type: "matcher"
//     });
//
//     expect(applyResponse).toHaveBeenCalledOnceWith(
//       jasmine.objectContaining({
//         propositions: [proposition]
//       })
//     );
//   });
//
//   it("does not satisfy rule due to unmatched browser", () => {
//     setupResponseHandler(applyResponse, mockWindow({}), {
//       definition: {
//         key: "browser.name",
//         matcher: "co",
//         values: ["Edge"]
//       },
//       type: "matcher"
//     });
//
//     expect(applyResponse).toHaveBeenCalledOnceWith(
//       jasmine.objectContaining({
//         propositions: []
//       })
//     );
//   });
// });
