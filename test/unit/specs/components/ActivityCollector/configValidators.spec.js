/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import configValidators from "../../../../../src/components/ActivityCollector/configValidators";
import testConfigValidators from "../../../helpers/testConfigValidators";

describe("ActivityCollector config validators", () => {
  testConfigValidators({
    configValidators,
    validConfigurations: [
      {},
      {
        clickCollectionEnabled: false
      },
      {
        clickCollectionEnabled: false,
        downloadLinkQualifier: ""
      }
    ],
    invalidConfigurations: [
      { clickCollectionEnabled: "" },
      {
        clickCollectionEnabled: true,
        downloadLinkQualifier: "["
      }
    ],
    defaultValues: {
      clickCollectionEnabled: false,
      downloadLinkQualifier:
        "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$"
    }
  });
});
