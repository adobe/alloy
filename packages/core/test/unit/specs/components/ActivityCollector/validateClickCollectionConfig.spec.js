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
import { beforeEach, describe, expect, it, vi } from "vitest";
import validateClickCollectionConfig from "../../../../../src/components/ActivityCollector/validateClickCollectionConfig.js";
import { DEFAULT_DOWNLOAD_QUALIFIER } from "../../../../../src/components/ActivityCollector/configValidators.js";

describe("ActivityCollector::validateClickCollectionConfig", () => {
  let logger;

  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };
  });

  it("warns when onBeforeLinkClickSend provided with clickCollectionEnabled false", () => {
    const config = {
      clickCollectionEnabled: false,
      onBeforeLinkClickSend: () => {},
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).toHaveBeenCalledWith(
      "The 'onBeforeLinkClickSend' configuration was provided but will be ignored because clickCollectionEnabled is false.",
    );
  });

  it("warns when custom downloadLinkQualifier provided with clickCollectionEnabled false", () => {
    const config = {
      clickCollectionEnabled: false,
      downloadLinkQualifier: "\\.pdf$",
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).toHaveBeenCalledWith(
      "The 'downloadLinkQualifier' configuration was provided but will be ignored because clickCollectionEnabled is false.",
    );
  });

  it("does not warn for default downloadLinkQualifier when disabled", () => {
    const config = {
      clickCollectionEnabled: false,
      downloadLinkQualifier: DEFAULT_DOWNLOAD_QUALIFIER,
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not warn when clickCollectionEnabled is true", () => {
    const config = {
      clickCollectionEnabled: true,
      onBeforeLinkClickSend: () => {},
      downloadLinkQualifier: "\\.pdf$",
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("does not warn when no click collection features configured", () => {
    const config = {
      clickCollectionEnabled: false,
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("handles undefined config values", () => {
    const config = {
      clickCollectionEnabled: false,
      onBeforeLinkClickSend: undefined,
      downloadLinkQualifier: undefined,
    };

    validateClickCollectionConfig(config, logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
