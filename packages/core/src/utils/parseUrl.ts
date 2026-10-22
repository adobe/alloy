/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import isString from "./isString.js";

export interface ParsedDomain {
  subdomain?: string;
  domain?: string;
  topLevelDomain?: string;
}

export interface ParseUriResult {
  host: string;
  path: string;
  query: string;
  anchor: string;
}

const parseDomainBasic = (host: string): ParsedDomain => {
  const result: ParsedDomain = {};
  const domainParts = host.split(".");

  switch (domainParts.length) {
    case 1:
      result.subdomain = "";
      result.domain = host;
      result.topLevelDomain = "";
      break;
    case 2:
      result.subdomain = "";
      result.domain = host;
      result.topLevelDomain = domainParts[1];
      break;
    case 3:
      result.subdomain = domainParts[0] === "www" ? "" : domainParts[0];
      result.domain = host;
      result.topLevelDomain = domainParts[2];
      break;
    case 4:
      result.subdomain = domainParts[0] === "www" ? "" : domainParts[0];
      result.domain = host;
      result.topLevelDomain = `${domainParts[2]}.${domainParts[3]}`;
      break;
    default:
      break;
  }

  return result;
};

const parseUri = (url: string): ParseUriResult => {
  try {
    const parsed = new URL(url);
    let path = parsed.pathname;
    if (!url.endsWith("/") && path === "/") {
      path = "";
    }
    return {
      host: parsed.hostname,
      path,
      query: parsed.search.replace(/^\?/, ""),
      anchor: parsed.hash.replace(/^#/, ""),
    };
  } catch {
    return {
      host: "",
      path: "",
      query: "",
      anchor: "",
    };
  }
};

const parseUrl = (
  url: unknown,
  parseDomain: (host: string) => object = parseDomainBasic,
) => {
  if (!isString(url)) {
    url = "";
  }

  const parsed = parseUri(url as string);
  const { host, path, query, anchor } = parsed;

  return {
    path,
    query,
    fragment: anchor,
    ...parseDomain(host),
  };
};

export default parseUrl;
