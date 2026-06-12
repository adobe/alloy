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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  acquireHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

const overrides = {
  com_adobe_experience_platform: {
    datasets: {
      event: {
        datasetId: "6335faf30f5a161c0b4b1444",
      },
    },
  },
  com_adobe_analytics: {
    reportSuites: ["unifiedjsqeonly2"],
  },
  com_adobe_identity: {
    idSyncContainerId: 30793,
  },
  com_adobe_target: {
    propertyToken: "a15d008c-5ec0-cabd-7fc7-ab54d56f01e8",
  },
};

const alternateOverrides = {
  com_adobe_experience_platform: {
    datasets: {
      event: {
        datasetId: "6336ff95ba16ca1c07b4c0db",
      },
    },
  },
  com_adobe_analytics: {
    reportSuites: ["unifiedjsqeonlymobileweb"],
  },
  com_adobe_identity: {
    idSyncContainerId: 30794,
  },
  com_adobe_target: {
    propertyToken: "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
  },
};

const IAB_CONSENT_IN = {
  consent: [
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA",
      gdprApplies: true,
    },
  ],
};

describe("sendEvent config overrides in request payload (C7437530)", () => {
  test("sendEvent passes config overrides from command options", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { edgeConfigOverrides: overrides });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_experience_platform
        .datasets.event,
    ).toEqual(overrides.com_adobe_experience_platform.datasets.event);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_identity
        .idSyncContainerId,
    ).toEqual(overrides.com_adobe_identity.idSyncContainerId);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target.propertyToken,
    ).toEqual(overrides.com_adobe_target.propertyToken);
  });

  test("sendEvent does not include configOverrides when none specified", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {});

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call.request.body.meta.configOverrides).toBeUndefined();
  });

  test("sendEvent passes config overrides from configure", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: overrides,
    });
    await alloy("sendEvent", {});

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_experience_platform
        .datasets.event,
    ).toEqual(overrides.com_adobe_experience_platform.datasets.event);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("sendEvent command overrides take precedence over configure overrides", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: alternateOverrides,
    });
    await alloy("sendEvent", { edgeConfigOverrides: overrides });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target.propertyToken,
    ).toEqual(overrides.com_adobe_target.propertyToken);
  });

  test("empty config override values are not sent to the edge", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: {
        ...alternateOverrides,
        com_adobe_target: { propertyToken: "" },
      },
    });
    await alloy("sendEvent", {
      edgeConfigOverrides: {
        ...overrides,
        com_adobe_target: { propertyToken: "" },
      },
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target,
    ).toBeUndefined();
  });

  test("sendEvent can override the datastreamId", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    const alternateDatastreamId = `${alloyConfig.datastreamId}:dev`;
    await alloy("sendEvent", {
      edgeConfigOverrides: { datastreamId: alternateDatastreamId },
    });

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call.request.url).toContain(alternateDatastreamId);
    expect(call.request.body.meta.sdkConfig.datastream.original).toBe(
      alloyConfig.datastreamId,
    );
  });
});

describe("getIdentity config overrides in request payload (C7437531)", () => {
  test("getIdentity passes config overrides from command options", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    await alloy("getIdentity", { edgeConfigOverrides: overrides });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_experience_platform
        .datasets.event,
    ).toEqual(overrides.com_adobe_experience_platform.datasets.event);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_identity
        .idSyncContainerId,
    ).toEqual(overrides.com_adobe_identity.idSyncContainerId);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target.propertyToken,
    ).toEqual(overrides.com_adobe_target.propertyToken);
  });

  test("getIdentity passes config overrides from configure", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: overrides,
    });
    await alloy("getIdentity");

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("getIdentity command overrides take precedence over configure overrides", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: alternateOverrides,
    });
    await alloy("getIdentity", { edgeConfigOverrides: overrides });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("empty config override values are not sent by getIdentity", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    await alloy("getIdentity", {
      edgeConfigOverrides: {
        ...overrides,
        com_adobe_target: { propertyToken: "" },
      },
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target,
    ).toBeUndefined();
  });

  test("getIdentity can override the datastreamId", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const alternateDatastreamId = `${alloyConfig.datastreamId}:dev`;
    await alloy("getIdentity", {
      edgeConfigOverrides: { datastreamId: alternateDatastreamId },
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(call.request.url).toContain(alternateDatastreamId);
    expect(call.request.body.meta.sdkConfig.datastream.original).toBe(
      alloyConfig.datastreamId,
    );
  });
});

describe("appendIdentityToUrl config overrides in request payload (C7437532)", () => {
  test("appendIdentityToUrl passes config overrides from command options", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    await alloy("appendIdentityToUrl", {
      url: "https://example.com",
      edgeConfigOverrides: overrides,
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target.propertyToken,
    ).toEqual(overrides.com_adobe_target.propertyToken);
  });

  test("appendIdentityToUrl passes config overrides from configure", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: overrides,
    });
    await alloy("appendIdentityToUrl", { url: "https://example.com" });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("appendIdentityToUrl command overrides take precedence over configure", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: alternateOverrides,
    });
    await alloy("appendIdentityToUrl", {
      url: "https://example.com",
      edgeConfigOverrides: overrides,
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("empty config override values are not sent by appendIdentityToUrl", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    await alloy("appendIdentityToUrl", {
      url: "https://example.com",
      edgeConfigOverrides: {
        ...overrides,
        com_adobe_target: { propertyToken: "" },
      },
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target,
    ).toBeUndefined();
  });

  test("appendIdentityToUrl can override the datastreamId", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);

    await alloy("configure", alloyConfig);
    const alternateDatastreamId = `${alloyConfig.datastreamId}:dev`;
    await alloy("appendIdentityToUrl", {
      url: "https://example.com",
      edgeConfigOverrides: { datastreamId: alternateDatastreamId },
    });

    const call = await networkRecorder.findCall(/v1\/identity\/acquire/);
    expect(call.request.url).toContain(alternateDatastreamId);
    expect(call.request.body.meta.sdkConfig.datastream.original).toBe(
      alloyConfig.datastreamId,
    );
  });
});

describe("setConsent config overrides in request payload (C7437533)", () => {
  test("setConsent passes config overrides from command options", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", alloyConfig);
    await alloy("setConsent", {
      ...IAB_CONSENT_IN,
      edgeConfigOverrides: overrides,
    });

    const call = await networkRecorder.findCall(/privacy\/set-consent/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target.propertyToken,
    ).toEqual(overrides.com_adobe_target.propertyToken);
  });

  test("setConsent passes config overrides from configure", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: overrides,
    });
    await alloy("setConsent", IAB_CONSENT_IN);

    const call = await networkRecorder.findCall(/privacy\/set-consent/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(overrides.com_adobe_analytics.reportSuites);
  });

  test("setConsent command overrides take precedence over configure overrides", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", {
      ...alloyConfig,
      edgeConfigOverrides: overrides,
    });
    await alloy("setConsent", {
      ...IAB_CONSENT_IN,
      edgeConfigOverrides: alternateOverrides,
    });

    const call = await networkRecorder.findCall(/privacy\/set-consent/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_analytics.reportSuites,
    ).toEqual(alternateOverrides.com_adobe_analytics.reportSuites);
  });

  test("empty config override values are not sent by setConsent", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", alloyConfig);
    await alloy("setConsent", {
      ...IAB_CONSENT_IN,
      edgeConfigOverrides: {
        ...overrides,
        com_adobe_target: { propertyToken: "" },
      },
    });

    const call = await networkRecorder.findCall(/privacy\/set-consent/);
    expect(
      call.request.body.meta.configOverrides.com_adobe_target,
    ).toBeUndefined();
  });

  test("setConsent can override the datastreamId", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler);

    await alloy("configure", alloyConfig);
    const alternateDatastreamId = `${alloyConfig.datastreamId}:dev`;
    await alloy("setConsent", {
      ...IAB_CONSENT_IN,
      edgeConfigOverrides: { datastreamId: alternateDatastreamId },
    });

    const call = await networkRecorder.findCall(/privacy\/set-consent/);
    expect(call.request.url).toContain(alternateDatastreamId);
    expect(call.request.body.meta.sdkConfig.datastream.original).toBe(
      alloyConfig.datastreamId,
    );
  });
});
