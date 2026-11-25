/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { afterEach, beforeEach, describe, it } from "vitest";
import useView from "../helpers/useView";
import field from "../helpers/field";
import SetConsentView from "../../../src/view/actions/setConsentView";
import { runRequiredComponentTests } from "../helpers/actions/requiredComponentTests";
import runInstanceNameOptionsTest from "../helpers/actions/instanceNameOptionsTest";
import { instances, LONG_TEST_TIMEOUT } from "../helpers/actions/fixtures";
import {
  buildEdgeConfigOverrides,
  configOverridesInstance,
  enableProductionOverrides,
  expectAllEnvironmentOverrides,
  expectNoEnvironmentOverrides,
  mockConfigOverridesDatastream,
  selectBlackbirdOverrides,
  typeAllEnvironmentOverrides,
  typedOverrideValues,
} from "../helpers/actions/configOverrides";

const extensionSettings = {
  instances: [{ name: "alloy", edgeConfigId: "PR123" }],
  components: { consent: true },
};

describe("Set consent action validation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(SetConsentView));
  });

  afterEach(() => cleanup());

  const init = (settings) =>
    driver.init({
      extensionSettings,
      settings: { instanceName: "alloy", ...settings },
    });

  it("accepts Adobe 1.0 consent", async () => {
    await init({
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    await driver.expectValidate().toBe(true);
  });

  it("requires a consent data element to be a data element", async () => {
    await init({ consent: "not a data element" });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("dataElementField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires the identity map to be a data element", async () => {
    await init({
      identityMap: "not a data element",
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("identityMapField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires Adobe 2.0 consent to be a data element", async () => {
    await init({
      consent: [{ standard: "Adobe", version: "2.0", value: "not valid" }],
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("valueField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires an IAB TCF value", async () => {
    await init({ consent: [{ standard: "IAB TCF", version: "2.0" }] });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("iabValueField")).expectError(
      /please specify a value/i,
    );
  });
});

const formExtensionSettings = { instances };

const consentObjectFieldIds = [
  "standardPicker",
  "adobeVersionPicker",
  "iabVersionField",
  "valueField",
  "generalInRadio",
  "generalOutRadio",
  "generalDataElementRadio",
  "generalDataElementField",
  "iabValueField",
  "gdprAppliesYesRadio",
  "gdprAppliesNoRadio",
  "gdprAppliesDataElementRadio",
  "gdprAppliesDataElementField",
  "gdprContainsPersonalDataYesRadio",
  "gdprContainsPersonalDataNoRadio",
  "gdprContainsPersonalDataDataElementRadio",
  "gdprContainsPersonalDataDataElementField",
  "deleteConsentButton",
];

const adobeOneZeroIds = [
  "generalInRadio",
  "generalOutRadio",
  "generalDataElementRadio",
  "generalDataElementField",
];
const adobeTwoZeroIds = ["valueField"];
const iabIds = [
  "iabVersionField",
  "iabValueField",
  "gdprAppliesYesRadio",
  "gdprAppliesNoRadio",
  "gdprAppliesDataElementRadio",
  "gdprAppliesDataElementField",
  "gdprContainsPersonalDataYesRadio",
  "gdprContainsPersonalDataNoRadio",
  "gdprContainsPersonalDataDataElementRadio",
  "gdprContainsPersonalDataDataElementField",
];
const everyStandardIds = ["standardPicker"];

describe("Set consent action form", () => {
  let view;
  let driver;
  let cleanup;
  let instanceNamePicker;
  let identityMapField;
  let inputMethodFormRadio;
  let inputMethodDataElementRadio;
  let addConsentButton;
  let dataElementField;

  const consentObject = (index) => {
    const container = view.getByTestId(`consentObject${index}`);
    return {
      container: field(container),
      ...Object.fromEntries(
        consentObjectFieldIds.map((id) => [
          id,
          field(container.getByTestId(id)),
        ]),
      ),
    };
  };

  const expectHiddenFields = async (object, ids) => {
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await object[id].expectHidden();
    }
  };

  const expectOnlyFields = async (object, shownGroups) => {
    const shown = new Set([...everyStandardIds, ...shownGroups.flat()]);
    await expectHiddenFields(
      object,
      [
        ...adobeOneZeroIds,
        ...adobeTwoZeroIds,
        ...iabIds,
        "adobeVersionPicker",
      ].filter((id) => !shown.has(id)),
    );
  };

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(SetConsentView));
    instanceNamePicker = field(view.getByTestId("instanceNamePicker"));
    identityMapField = field(view.getByTestId("identityMapField"));
    inputMethodFormRadio = field(view.getByTestId("inputMethodFormRadio"));
    inputMethodDataElementRadio = field(
      view.getByTestId("inputMethodDataElementRadio"),
    );
    addConsentButton = field(view.getByTestId("addConsentButton"));
    dataElementField = field(view.getByTestId("dataElementField"));
  });

  afterEach(() => cleanup());

  it(
    "initializes form fields with settings containing a static consent array",
    async () => {
      const overrideValues = {
        ...typedOverrideValues,
        datastreamId: undefined,
        sandbox: "prod",
        reportSuites: ["unifiedjsqeonly2"],
      };
      await driver.init({
        extensionSettings: formExtensionSettings,
        settings: {
          instanceName: "alloy2",
          identityMap: "%dataelement1%",
          consent: [
            { standard: "Adobe", version: "1.0", value: { general: "out" } },
            {
              standard: "IAB TCF",
              version: "2.0",
              value: "1234abcd",
              gdprApplies: false,
              gdprContainsPersonalData: true,
            },
            { standard: "Adobe", version: "2.0", value: "%dataelement2%" },
          ],
          edgeConfigOverrides: buildEdgeConfigOverrides(overrideValues, {
            withEnabled: false,
          }),
        },
      });

      await instanceNamePicker.expectValue("alloy2");
      await identityMapField.expectValue("%dataelement1%");
      await inputMethodFormRadio.expectChecked();
      await inputMethodDataElementRadio.expectUnchecked();
      await dataElementField.expectHidden();
      await addConsentButton.expectVisible();

      const adobeOneZero = consentObject(0);
      await adobeOneZero.standardPicker.expectValue("Adobe");
      await adobeOneZero.adobeVersionPicker.expectValue("1.0");
      await adobeOneZero.generalInRadio.expectUnchecked();
      await adobeOneZero.generalOutRadio.expectChecked();
      await adobeOneZero.generalDataElementRadio.expectUnchecked();
      await expectOnlyFields(adobeOneZero, [
        ["adobeVersionPicker"],
        adobeOneZeroIds.slice(0, 3),
      ]);

      const iab = consentObject(1);
      await iab.standardPicker.expectValue("IAB TCF");
      await iab.iabVersionField.expectValue("2.0");
      await iab.iabValueField.expectValue("1234abcd");
      await iab.gdprAppliesYesRadio.expectUnchecked();
      await iab.gdprAppliesNoRadio.expectChecked();
      await iab.gdprAppliesDataElementRadio.expectUnchecked();
      await iab.gdprContainsPersonalDataYesRadio.expectChecked();
      await iab.gdprContainsPersonalDataNoRadio.expectUnchecked();
      await iab.gdprContainsPersonalDataDataElementRadio.expectUnchecked();
      await expectOnlyFields(iab, [
        iabIds.filter((id) => !id.endsWith("DataElementField")),
      ]);
      await iab.gdprAppliesDataElementField.expectHidden();
      await iab.gdprContainsPersonalDataDataElementField.expectHidden();

      const adobeTwoZero = consentObject(2);
      await adobeTwoZero.standardPicker.expectValue("Adobe");
      await adobeTwoZero.adobeVersionPicker.expectValue("2.0");
      await adobeTwoZero.valueField.expectValue("%dataelement2%");
      await expectOnlyFields(adobeTwoZero, [
        ["adobeVersionPicker"],
        adobeTwoZeroIds,
      ]);

      await expectAllEnvironmentOverrides(view, overrideValues);
    },
    LONG_TEST_TIMEOUT,
  );

  it("initializes form fields with settings containing data elements for parts", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: {
        instanceName: "alloy2",
        identityMap: "%data0%",
        consent: [
          { standard: "Adobe", version: "1.0", value: { general: "%data1%" } },
          {
            standard: "IAB TCF",
            version: "2.0",
            value: "%data2%",
            gdprApplies: "%data3%",
            gdprContainsPersonalData: "%data4%",
          },
        ],
      },
    });

    await instanceNamePicker.expectValue("alloy2");
    await identityMapField.expectValue("%data0%");
    await inputMethodFormRadio.expectChecked();
    await dataElementField.expectHidden();

    const adobe = consentObject(0);
    await adobe.generalInRadio.expectUnchecked();
    await adobe.generalOutRadio.expectUnchecked();
    await adobe.generalDataElementRadio.expectChecked();
    await adobe.generalDataElementField.expectValue("%data1%");

    const iab = consentObject(1);
    await iab.iabValueField.expectValue("%data2%");
    await iab.gdprAppliesYesRadio.expectUnchecked();
    await iab.gdprAppliesNoRadio.expectUnchecked();
    await iab.gdprAppliesDataElementRadio.expectChecked();
    await iab.gdprAppliesDataElementField.expectValue("%data3%");
    await iab.gdprContainsPersonalDataYesRadio.expectUnchecked();
    await iab.gdprContainsPersonalDataNoRadio.expectUnchecked();
    await iab.gdprContainsPersonalDataDataElementRadio.expectChecked();
    await iab.gdprContainsPersonalDataDataElementField.expectValue("%data4%");
  });

  it("initializes form fields with settings containing data element for consent", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: {
        instanceName: "alloy2",
        identityMap: "%data1%",
        consent: "%data2%",
      },
    });

    await instanceNamePicker.expectValue("alloy2");
    await identityMapField.expectValue("%data1%");
    await inputMethodFormRadio.expectUnchecked();
    await inputMethodDataElementRadio.expectChecked();
    await dataElementField.expectValue("%data2%");
    await addConsentButton.expectHidden();
    await consentObject(0).container.expectHidden();
  });

  it(
    "initializes form fields with no settings",
    async () => {
      await driver.init({
        extensionSettings: formExtensionSettings,
        settings: null,
      });

      await instanceNamePicker.expectValue("alloy1");
      await identityMapField.expectValue("");
      await inputMethodFormRadio.expectChecked();
      await inputMethodDataElementRadio.expectUnchecked();
      await dataElementField.expectHidden();
      await addConsentButton.expectVisible();

      const first = consentObject(0);
      await first.standardPicker.expectValue("Adobe");
      await first.adobeVersionPicker.expectValue("1.0");
      await first.adobeVersionPicker.selectOption("2.0");
      await first.valueField.expectValue("");
      await expectOnlyFields(first, [["adobeVersionPicker"], adobeTwoZeroIds]);
      await consentObject(1).container.expectHidden();

      await first.adobeVersionPicker.selectOption("1.0");
      await first.generalInRadio.expectChecked();
      await first.generalOutRadio.expectUnchecked();
      await first.generalDataElementRadio.expectUnchecked();
      await first.generalDataElementField.expectHidden();
      await first.valueField.expectHidden();

      await first.standardPicker.selectOption("IAB TCF");
      await first.standardPicker.expectValue("IAB TCF");
      await first.iabVersionField.expectValue("2.0");
      await first.iabValueField.expectValue("");
      await first.gdprAppliesYesRadio.expectChecked();
      await first.gdprAppliesNoRadio.expectUnchecked();
      await first.gdprAppliesDataElementRadio.expectUnchecked();
      await first.gdprContainsPersonalDataYesRadio.expectUnchecked();
      await first.gdprContainsPersonalDataNoRadio.expectChecked();
      await first.gdprContainsPersonalDataDataElementRadio.expectUnchecked();
      await expectOnlyFields(first, [
        iabIds.filter((id) => !id.endsWith("DataElementField")),
      ]);
      await consentObject(1).container.expectHidden();

      for (const environment of ["production", "staging", "development"]) {
        // eslint-disable-next-line no-await-in-loop
        await expectNoEnvironmentOverrides(view, environment);
      }
    },
    LONG_TEST_TIMEOUT,
  );

  it("returns minimal valid settings", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: null,
    });

    await addConsentButton.click();
    await consentObject(1).standardPicker.selectOption("IAB TCF");
    await consentObject(1).iabVersionField.fill("2.1");
    await consentObject(1).iabValueField.fill("1234abcd");
    await addConsentButton.click();
    await consentObject(2).adobeVersionPicker.selectOption("2.0");
    await consentObject(2).valueField.fill("%dataelement2%");

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      instanceName: "alloy1",
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
        {
          standard: "IAB TCF",
          version: "2.1",
          value: "1234abcd",
          gdprApplies: true,
          gdprContainsPersonalData: false,
        },
        { standard: "Adobe", version: "2.0", value: "%dataelement2%" },
      ],
    });
  });

  it(
    "returns full valid settings",
    async () => {
      const overrideValues = {
        ...typedOverrideValues,
        datastreamId: "1234abcd",
      };
      await driver.init({
        extensionSettings: formExtensionSettings,
        settings: null,
      });

      await instanceNamePicker.selectOption("alloy2");
      await identityMapField.fill("%data0%");
      await consentObject(0).standardPicker.selectOption("IAB TCF");
      await consentObject(0).iabVersionField.fill("2.2");
      await consentObject(0).iabValueField.fill("a");
      await consentObject(0).gdprAppliesNoRadio.click();
      await consentObject(0).gdprContainsPersonalDataYesRadio.click();
      await addConsentButton.click();
      await consentObject(1).adobeVersionPicker.selectOption("1.0");
      await consentObject(1).generalOutRadio.click();
      await typeAllEnvironmentOverrides(view, overrideValues);

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy2",
        identityMap: "%data0%",
        consent: [
          {
            standard: "IAB TCF",
            version: "2.2",
            value: "a",
            gdprApplies: false,
            gdprContainsPersonalData: true,
          },
          { standard: "Adobe", version: "1.0", value: { general: "out" } },
        ],
        edgeConfigOverrides: buildEdgeConfigOverrides(overrideValues),
      });
    },
    LONG_TEST_TIMEOUT,
  );

  it("returns valid settings for guided form data elements", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: null,
    });

    await consentObject(0).generalDataElementRadio.click();
    await consentObject(0).generalDataElementField.fill("%data1%");
    await addConsentButton.click();
    await consentObject(1).standardPicker.selectOption("IAB TCF");
    await consentObject(1).iabVersionField.fill("2.3");
    await consentObject(1).iabValueField.fill("%data2%");
    await consentObject(1).gdprAppliesDataElementRadio.click();
    await consentObject(1).gdprAppliesDataElementField.fill("%data3%");
    await consentObject(1).gdprContainsPersonalDataDataElementRadio.click();
    await consentObject(1).gdprContainsPersonalDataDataElementField.fill(
      "%data4%",
    );

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      instanceName: "alloy1",
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "%data1%" } },
        {
          standard: "IAB TCF",
          version: "2.3",
          value: "%data2%",
          gdprApplies: "%data3%",
          gdprContainsPersonalData: "%data4%",
        },
      ],
    });
  });

  it("returns valid settings for data element", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: null,
    });

    await inputMethodDataElementRadio.click();
    await dataElementField.fill("%data2%");

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ instanceName: "alloy1", consent: "%data2%" });
  });

  it("deletes consent objects", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: null,
    });

    await consentObject(0).standardPicker.selectOption("IAB TCF");
    await consentObject(0).iabVersionField.fill("1");
    await consentObject(0).deleteConsentButton.expectHidden();
    await consentObject(1).container.expectHidden();

    await addConsentButton.click();
    await consentObject(0).deleteConsentButton.expectEnabled();
    await consentObject(1).standardPicker.selectOption("IAB TCF");
    await consentObject(1).iabVersionField.fill("2");
    await consentObject(0).deleteConsentButton.click();
    await consentObject(0).iabVersionField.expectValue("2");
    await consentObject(1).container.expectHidden();

    await addConsentButton.click();
    await consentObject(1).standardPicker.selectOption("IAB TCF");
    await consentObject(1).iabVersionField.fill("23");
    await consentObject(1).deleteConsentButton.click();
    await consentObject(1).container.expectHidden();
    await consentObject(0).iabVersionField.expectValue("2");
  });

  it("shows errors for empty values", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: null,
    });

    await addConsentButton.click();
    await consentObject(0).adobeVersionPicker.selectOption("2.0");
    await consentObject(1).standardPicker.selectOption("IAB TCF");
    await consentObject(1).iabVersionField.clear();
    await consentObject(1).gdprAppliesDataElementRadio.click();
    await consentObject(1).gdprContainsPersonalDataDataElementRadio.click();
    await addConsentButton.click();
    await consentObject(2).generalDataElementRadio.click();

    await driver.expectValidate().toBe(false);
    await consentObject(0).valueField.expectError(
      /please specify a data element/i,
    );
    await consentObject(1).iabVersionField.expectError(
      /please specify a version/i,
    );
    await consentObject(1).iabValueField.expectError(/please specify a value/i);
    await consentObject(1).gdprAppliesDataElementField.expectError(
      /please specify a data element/i,
    );
    await consentObject(1).gdprContainsPersonalDataDataElementField.expectError(
      /please specify a data element/i,
    );
    await consentObject(2).generalDataElementField.expectError(
      /please specify a data element/i,
    );
  });

  it(
    "shows errors for things that aren't data elements and does not show errors for hidden invalid fields",
    async () => {
      await driver.init({
        extensionSettings: formExtensionSettings,
        settings: null,
      });

      await consentObject(0).generalDataElementRadio.click();
      await consentObject(0).generalDataElementField.fill("notadataelement");
      await addConsentButton.click();
      await consentObject(1).standardPicker.selectOption("IAB TCF");
      await consentObject(1).iabVersionField.fill("2");
      await consentObject(1).iabValueField.fill("notadataelement");
      await consentObject(1).gdprAppliesDataElementRadio.click();
      await consentObject(1).gdprAppliesDataElementField.fill("%data1%%data2%");
      await consentObject(1).gdprContainsPersonalDataDataElementRadio.click();
      await consentObject(1).gdprContainsPersonalDataDataElementField.fill(
        "%notadataelement",
      );
      await addConsentButton.click();
      await consentObject(2).adobeVersionPicker.selectOption("2.0");
      await consentObject(2).valueField.fill("notadataelement");

      await driver.expectValidate().toBe(false);
      await consentObject(0).generalDataElementField.expectError(
        /please specify a data element/i,
      );
      await consentObject(1).iabValueField.expectNotInvalid();
      await consentObject(1).gdprAppliesDataElementField.expectError(
        /please specify a data element/i,
      );
      await consentObject(
        1,
      ).gdprContainsPersonalDataDataElementField.expectError(
        /please specify a data element/i,
      );
      await consentObject(2).valueField.expectError(
        /please specify a data element/i,
      );

      await inputMethodDataElementRadio.click();
      await dataElementField.fill("%dataelement%");
      await driver.expectValidate().toBe(true);

      await dataElementField.fill("%dataelement%notadataelement");
      await driver.expectValidate().toBe(false);
      await dataElementField.expectError(/please specify a data element/i);

      await inputMethodFormRadio.click();
      await consentObject(0).generalInRadio.click();
      await consentObject(1).gdprAppliesYesRadio.click();
      await consentObject(1).gdprContainsPersonalDataYesRadio.click();
      await consentObject(2).valueField.fill("%dataelement%");
      await driver.expectValidate().toBe(true);
    },
    LONG_TEST_TIMEOUT,
  );

  it("remembers the initial data element value", async () => {
    const settings = {
      instanceName: "alloy2",
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: { general: "%dataelement1%" },
        },
      ],
    };
    await driver.init({ extensionSettings: formExtensionSettings, settings });

    await consentObject(0).generalInRadio.click();
    await consentObject(0).generalDataElementRadio.click();

    await consentObject(0).generalDataElementField.expectValue(
      "%dataelement1%",
    );
    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual(settings);
  });

  it("can show the consent object form when consent is initially a data element", async () => {
    await driver.init({
      extensionSettings: formExtensionSettings,
      settings: { instanceName: "alloy1", consent: "%dataElement1%" },
    });

    await inputMethodFormRadio.click();

    await consentObject(0).standardPicker.expectVisible();
  });

  it(
    "populates overrides dropdowns with Blackbird config data",
    async () => {
      mockConfigOverridesDatastream();
      await driver.init({
        extensionSettings: { instances: [configOverridesInstance] },
        settings: null,
      });

      await enableProductionOverrides(view);
      const expectedOverrides = await selectBlackbirdOverrides(view);

      await driver.expectValidate().toBe(true);
      await driver
        .expectSettings((settings) => settings.edgeConfigOverrides)
        .toEqual({ production: expectedOverrides });
    },
    LONG_TEST_TIMEOUT,
  );
});

runRequiredComponentTests({
  openView: () => useView(SetConsentView),
  requiredComponent: "consent",
  minimumValidSettings: { instanceName: "alloy", consent: "%myconsent%" },
  formTestId: "instanceNamePicker",
});

runInstanceNameOptionsTest({
  openView: () => useView(SetConsentView),
  pickerTestId: "instanceNamePicker",
});
