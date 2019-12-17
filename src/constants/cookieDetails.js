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

export const IDENTITY_COOKIE_KEY = "identity";

// Remember to also incorporate the org ID wherever cookies are read or written.
export const COOKIE_NAME_PREFIX = "kndctr";

// TODO: Currently the opt-in cookie is not managed by Konductor and therefore
// does not use the same cookie prefix. This will change once Konductor
// starts managing it.
export const OPT_IN_COOKIE_NAME = "adobe_alloy_optIn";
