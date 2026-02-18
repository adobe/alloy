import { RequestLogger } from "testcafe";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import extensionViewController from "../../../helpers/extensionViewController.mjs";
import * as selectors from "../../../helpers/dataTestIdSelectors.mjs";
import {
  LIBRARY_TYPE_MANAGED,
  LIBRARY_TYPE_PREINSTALLED,
} from "../../../../../src/view/constants/libraryType.js";

// Create selectors for our test data-test-ids
const libraryCodeField = selectors.createTestIdSelector("libraryCodeField");
const orgIdField = selectors.createTestIdSelector("orgIdField");
const edgeDomainField = selectors.createTestIdSelector("edgeDomainField");

const url = "http://localhost:3000/view/configuration/configuration.html";

const extensionSettings = {
  libraryCode: {
    type: LIBRARY_TYPE_MANAGED,
  },
  instances: [
    {
      name: "alloy",
      edgeConfigId: "PR123",
    },
  ],
};

const preinstalledExtensionSettings = {
  libraryCode: {
    type: LIBRARY_TYPE_PREINSTALLED,
  },
  instances: [
    {
      name: "alloy",
    },
  ],
};

const logger = RequestLogger(
  { url, method: "POST" },
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  },
);

fixture`Configuration View`
  .page(url)
  .requestHooks(logger)
  .beforeEach(async (t) => {
    await createExtensionViewFixture({
      t,
      viewPath: "configuration/configuration.html",
    });
  });

test("should hide fields when preinstalled library type is selected", async (t) => {
  await extensionViewController.init(extensionSettings);

  // Fields should be visible in managed mode
  await t.expect(orgIdField.exists).ok();
  await t.expect(edgeDomainField.exists).ok();

  // Switch to preinstalled mode by clicking the second radio button
  const preinstalledRadio = libraryCodeField.find(
    `input[value="${LIBRARY_TYPE_PREINSTALLED}"]`,
  );
  await t.click(preinstalledRadio);

  // Fields should be hidden in preinstalled mode
  await t.expect(orgIdField.exists).notOk();
  await t.expect(edgeDomainField.exists).notOk();
});

test("should save preinstalled type correctly", async (t) => {
  await extensionViewController.init(extensionSettings);

  // Switch to preinstalled mode
  const preinstalledRadio = libraryCodeField.find(
    `input[value="${LIBRARY_TYPE_PREINSTALLED}"]`,
  );
  await t.click(preinstalledRadio);

  await extensionViewController.saveSettings();

  const { request } = logger.requests[0];
  const settings = JSON.parse(request.body).data.attributes.settings;

  await t.expect(settings.libraryCode.type).eql(LIBRARY_TYPE_PREINSTALLED);
});

test("should save managed type correctly", async (t) => {
  await extensionViewController.init(extensionSettings);

  // Managed mode should be selected by default - no action needed
  await extensionViewController.saveSettings();

  const { request } = logger.requests[0];
  const settings = JSON.parse(request.body).data.attributes.settings;

  await t.expect(settings.libraryCode.type).eql(LIBRARY_TYPE_MANAGED);
});

test("should show fields with preinstalled settings", async (t) => {
  await extensionViewController.init(preinstalledExtensionSettings);

  // Fields should be hidden in preinstalled mode
  await t.expect(orgIdField.exists).notOk();
  await t.expect(edgeDomainField.exists).notOk();

  // Only instance name should be visible (and required)
  const instanceNameField = selectors.createTestIdSelector("instanceNameField");
  await t.expect(instanceNameField.exists).ok();
});

test("should validate instance name in preinstalled mode", async (t) => {
  await extensionViewController.init(preinstalledExtensionSettings);

  // Clear the instance name to trigger validation
  const instanceNameField = selectors.createTestIdSelector("instanceNameField");
  await t.selectText(instanceNameField).pressKey("delete");

  await extensionViewController.saveSettings();

  // Should show validation error for missing instance name
  await t.expect(extensionViewController.isValid()).notOk();
});
