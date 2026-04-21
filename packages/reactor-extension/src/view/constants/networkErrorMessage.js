/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// The internet connection may not actually be the problem here. There could
// be other problems with the SSL handshake, CORS preflight request, etc.
export const UNABLE_TO_CONNECT_TO_SERVER =
  "A connection to the server could not be established. You may be disconnected from the internet. Please check your connection and try again.";
export const UNEXPECTED_SERVER_RESPONSE =
  "An unexpected server response was received.";
export const INVALID_ACCESS_TOKEN =
  "Your access token appears to be invalid. Please try logging in again.";
export const RESOURCE_NOT_FOUND = "The resource was not found.";
export const FORBIDDEN_ACCESS =
  "You don't have enough permissions to access this resource.";
