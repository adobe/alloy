/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Determines if a domain fits within the provided apex domain.
 * @param {!string} domain A domain name, e.g. subdomain.example.com
 * @param {string} apexDomain An apex domain, e.g. example.com
 * @returns {!boolean}
 */
export default (domain, apexDomain) => {
  const regex = new RegExp(`${apexDomain}$`);
  return regex.test(domain);
};
