import { expect, test, vi } from 'vitest'
import createInstance from "../../src/core/createInstance.js";
import createDebug from "../../src/components/Debug/index.js";
import dataCollector from "../../src/components/DataCollector/index.js";

test("works", () => {
  const components = [];
  const instanceName = "myalloy";
  const getMonitors = () => [];
  const getAssuranceToken = () => undefined;
  const sendRequest = () => undefined;
  const getState = () => { };
  const updateState = () => undefined;
  const getStateEntry = () => undefined;
  const context = {};

  const instance = createInstance({
    components,
    instanceName,
    getMonitors,
    getAssuranceToken,
    sendRequest,
    getState,
    updateState,
    getStateEntry,
    context,
  });

  expect(instance).toBeDefined();
  instance("configure", { datastreamId: "mydatastreamid", orgId: "myorgid" });
  instance("getLibraryInfo").then(console.log);
});

test("set debug works", async () => {
  const monitors = [];
  const storage = {};

  const logs = [];
  const logger = {
    info: (...args) => { logs.push(["info", ...args]); },
    warn: (...args) => { logs.push(["warn", ...args]); },
    error: (...args) => { logs.push(["error", ...args]); },
  };
  const addMonitor = (monitor) => { monitors.push(monitor); };
  const getDebugEnabled = (instanceName) => {
    return storage[instanceName];
  };
  const setDebugEnabled = (instanceName, value) => {
    storage[instanceName] = value;
  };
  const debug = createDebug({ addMonitor, setDebugEnabled, getDebugEnabled, logger });

  const components = [debug];
  const instanceName = "myalloy";
  const getMonitors = () => monitors;
  const getAssuranceToken = () => undefined;
  const sendRequest = () => undefined;
  const getState = () => { };
  const updateState = () => undefined;
  const getStateEntry = () => undefined;
  const context = {};

  const instance = createInstance({
    components,
    instanceName,
    getMonitors,
    getAssuranceToken,
    sendRequest,
    getState,
    updateState,
    getStateEntry,
    context,
  });

  expect(instance).toBeDefined();
  await instance("configure", { datastreamId: "mydatastreamid", orgId: "myorgid", debugEnabled: true });
  //await instance("setDebug", { enabled: true });
  console.log(logs);
  console.log(monitors);
});

test("data collector works", async () => {

  const components = [dataCollector];
  const instanceName = "myalloy";
  const getMonitors = () => [];
  const getAssuranceToken = () => undefined;

  const sendRequest = vi.fn(() =>
    Promise.resolve({
      statusCode: 200,
      body: JSON.stringify({ handle: [] }),
      getHeader: () => undefined,
    })
  );
  const getState = () => { };
  const updateState = () => undefined;
  const getStateEntry = () => undefined;
  const context = {};

  const instance = createInstance({
    components,
    instanceName,
    getMonitors,
    getAssuranceToken,
    sendRequest,
    getState,
    updateState,
    getStateEntry,
    context,
  });

  expect(instance).toBeDefined();
  await instance("configure", { datastreamId: "mydatastreamid", orgId: "myorgid" });
  await instance("sendEvent", { xdm: { mykey: "myvalue" } });
  console.log(sendRequest.mock.calls);
});
