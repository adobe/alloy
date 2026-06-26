/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Factory that returns a JIRA REST API client.
 * @param {{ dryRun?: boolean, baseUrl: string, token: string }} opts
 */
export default function createApi({ dryRun = false, baseUrl, token }) {
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  async function request(method, path, body) {
    const url = `${baseUrl}${path}`;
    if (dryRun) {
      console.log(`[dry-run] ${method} ${url}`);
      if (body !== undefined) console.log(JSON.stringify(body, null, 2));
      return {};
    }
    const response = await fetch(url, {
      method,
      headers: authHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `JIRA ${method} ${path} failed: ${response.status} ${text}`,
      );
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async function searchIssues(jql, { fields = "key", maxResults = 50 } = {}) {
    const qs = `jql=${encodeURIComponent(jql)}&fields=${fields}&maxResults=${maxResults}`;
    if (dryRun) {
      console.log(`[dry-run] Search: GET ${baseUrl}/rest/api/2/search?${qs}`);
      return [];
    }
    const response = await fetch(`${baseUrl}/rest/api/2/search?${qs}`, {
      headers: authHeaders,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.issues ?? [];
  }

  async function getRemoteLinks(key) {
    if (dryRun) return [];
    const response = await fetch(
      `${baseUrl}/rest/api/2/issue/${key}/remotelink`,
      { headers: authHeaders },
    );
    if (!response.ok) return [];
    return response.json();
  }

  return { dryRun, request, searchIssues, getRemoteLinks };
}
