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

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { spawnSync } from "child_process";
import fs from "fs";
import { setTimeout } from "timers/promises";

vi.mock("child_process", () => ({ spawnSync: vi.fn() }));
vi.mock("fs", () => ({
  default: { readFileSync: vi.fn(), existsSync: vi.fn() },
}));
vi.mock("timers/promises", () => ({ setTimeout: vi.fn() }));

// eslint-disable-next-line import/extensions, import/no-relative-packages -- The release CLI is not exposed by the sandbox's public exports.
import { main } from "../sandboxes/browser/scripts/release.mjs";

const TOKEN = "sandbox-deployment-secret";
const METADATA_FAILURE =
  "Deployment Failure Reason: Could not load StaticSitesClient metadata from remote. Please check your internet connection.";
const METADATA_RESET = `Error fetching release metadata: FetchError: request to https://aka.ms/swalocaldeploy failed, reason: socket hang up\n${METADATA_FAILURE}`;
const DOWNLOAD_URL = "https://example.test/StaticSitesClient";
const downloadStatus = (status) =>
  `Deployment Failure Reason: Failed to download StaticSitesClient binary from url ${DOWNLOAD_URL}. File not found (${status})`;

describe("sandbox release", () => {
  let originalExitCode;

  beforeEach(() => {
    originalExitCode = process.exitCode;
    process.exitCode = undefined;
    vi.stubEnv("AZURE_STATIC_WEB_APPS_API_TOKEN", TOKEN);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: "sandbox", version: "1.2.3" }),
    );
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(setTimeout).mockResolvedValue(undefined);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.mocked(spawnSync).mockReset();
    vi.mocked(setTimeout).mockReset();
    process.exitCode = originalExitCode;
  });

  const mockDeployments = (...results) => {
    vi.mocked(spawnSync).mockReturnValue({ status: 0 });
    results.forEach((result) => {
      vi.mocked(spawnSync).mockReturnValueOnce(result);
    });
  };

  test("can be imported without building, deploying, or requiring credentials", () => {
    expect(spawnSync).not.toHaveBeenCalled();
  });

  test("builds once and deploys the existing production build on success", async () => {
    mockDeployments(
      { status: 0 },
      { status: 0, stdout: "Deployed", stderr: "" },
    );

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      "pnpm",
      ["run", "build"],
      expect.objectContaining({ stdio: "inherit" }),
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      "pnpm",
      [
        "exec",
        "swa",
        "deploy",
        expect.stringMatching(/sandboxes\/browser\/build$/),
        "--deployment-token",
        TOKEN,
        "--env",
        "production",
      ],
      expect.objectContaining({
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      }),
    );
    expect(setTimeout).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  test.each([
    METADATA_FAILURE,
    `\u001b[31m${METADATA_FAILURE}\u001b[39m`,
    METADATA_RESET,
    `Error fetching release metadata: FetchError: getaddrinfo EAI_AGAIN aka.ms\n${METADATA_FAILURE}`,
    `Response.status = 429 Too Many Requests\n${METADATA_FAILURE}`,
    `Response.status = 503 Service Unavailable\n${METADATA_FAILURE}`,
    downloadStatus(502),
    `Downloading ${DOWNLOAD_URL}@build-id\nDeployment Failure Reason: request to ${DOWNLOAD_URL} failed, reason: connect ETIMEDOUT`,
  ])("retries a transient pre-deployment failure: %s", async (output) => {
    mockDeployments(
      { status: 0 },
      { status: 1, stderr: output },
      { status: 0 },
    );

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(3);
    expect(spawnSync.mock.calls[2]).toEqual(spawnSync.mock.calls[1]);
    expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
    expect(process.exitCode).toBeUndefined();
  });

  test("bounds retries for opaque metadata failures at normal verbosity", async () => {
    const failure = {
      status: 1,
      stdout: "Could not find StaticSitesClient local binary\n",
      stderr: `✖ Deployment Failed :(\n✖ ${METADATA_FAILURE}\n`,
    };
    mockDeployments({ status: 0 }, failure, failure, failure);

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(4);
    expect(setTimeout.mock.calls).toEqual([[5000], [10000]]);
    expect(process.exitCode).toBe(1);
  });

  test("caps deployment attempts at three and preserves the last failure status", async () => {
    mockDeployments(
      { status: 0 },
      { status: 1, stdout: METADATA_RESET },
      { status: 1, stderr: METADATA_RESET },
      { status: 7, stderr: METADATA_RESET },
    );

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(4);
    expect(setTimeout.mock.calls).toEqual([[5000], [10000]]);
    expect(process.exitCode).toBe(7);
  });

  test.each([
    `Response.status = 401 Unauthorized\n${METADATA_FAILURE}`,
    `Response.status = 403 Forbidden\n${METADATA_FAILURE}`,
    `Response.status = 404 Not Found\n${METADATA_FAILURE}`,
    `Error fetching release metadata: SyntaxError: Unexpected token in JSON\n${METADATA_FAILURE}`,
    "Could not find release metadata; returning undefined",
    downloadStatus(403),
    downloadStatus(404),
    "Deployment Failure Reason: Checksum mismatch for StaticSitesClient!",
    "Deployment Failure Reason: Unsupported platform: freebsd",
    "Deployment token is invalid",
    `${METADATA_FAILURE}\nHTTP 401`,
    "Deployment failed with exit code 1: connect ETIMEDOUT",
    `${METADATA_RESET}\nDeployment failed with exit code 1`,
    `Downloading ${DOWNLOAD_URL}@build-id\nPreparing deployment. Please wait...\nDeployment Failure Reason: request to ${DOWNLOAD_URL} failed, reason: socket hang up`,
  ])(
    "does not retry a nontransient or unclassified failure: %s",
    async (output) => {
      mockDeployments({ status: 0 }, { status: 3, stderr: output });

      await main();

      expect(spawnSync).toHaveBeenCalledTimes(2);
      expect(setTimeout).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(3);
    },
  );

  test.each([
    { error: new Error("spawn pnpm ENOENT"), status: null },
    { signal: "SIGTERM", status: null },
    { error: new Error("maxBuffer exceeded"), status: 1 },
    { status: null },
    {},
  ])("does not retry abnormal deployment termination: %j", async (result) => {
    mockDeployments({ status: 0 }, { ...result, stdout: METADATA_RESET });

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test("does not deploy or retry when the build fails", async () => {
    mockDeployments({ status: 2 });

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(2);
  });

  test("stops retrying if the next attempt reports an authentication failure", async () => {
    mockDeployments(
      { status: 0 },
      { status: 1, stderr: METADATA_FAILURE },
      { status: 4, stderr: "Deployment token is invalid" },
    );

    await main();

    expect(spawnSync).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledExactlyOnceWith(5000);
    expect(process.exitCode).toBe(4);
  });

  test("requires the token before building", async () => {
    vi.stubEnv("AZURE_STATIC_WEB_APPS_API_TOKEN", "");

    await expect(main()).rejects.toThrow(
      "AZURE_STATIC_WEB_APPS_API_TOKEN must be set",
    );

    expect(spawnSync).not.toHaveBeenCalled();
  });

  test("requires build output before deploying", async () => {
    mockDeployments({ status: 0 });
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await expect(main()).rejects.toThrow("Expected build output");

    expect(spawnSync).toHaveBeenCalledTimes(1);
  });

  test("redacts the token from captured output and spawn diagnostics", async () => {
    mockDeployments(
      { status: 0 },
      {
        error: new Error(`spawn failed: ${TOKEN}`),
        status: null,
        stdout: `Response.status = 503\n${TOKEN}\n${TOKEN}`,
        stderr: `stderr: ${TOKEN}`,
      },
    );

    await main();

    const logged = [
      ...process.stdout.write.mock.calls,
      ...process.stderr.write.mock.calls,
      ...console.log.mock.calls,
      ...console.error.mock.calls,
    ]
      .flat()
      .join("\n");
    expect(logged).not.toContain(TOKEN);
    expect(logged).not.toContain("--deployment-token");
    expect(logged).toContain("<hidden>");
    expect(logged).toContain("Response.status = 503");
  });
});
