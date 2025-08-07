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

// Cookie Keys
export const ADVERTISING_COOKIE_KEY = "advertising";
export const SURFER_ID_COOKIE_KEY = "surfer_id";
export const RAMP_ID_COOKIE_KEY = "ramp_id";
export const ID5_COOKIE_KEY = "id5_id";
export const LAST_CLICK_COOKIE_KEY = "_les_lsc";
export const LAST_CONVERSION_TIME_KEY = "lastConversionTime";
export const DISPLAY_CLICK_COOKIE_KEY_EXPIRES = "displayClickCookieExpires";

// URL Parameters
export const SKWCID_PARAM = "s_kwcid";
export const EFID_PARAM = "ef_id";

// Identity Types
export const SURFER_ID = "surferId";
export const RAMP_ID = "rampId";
export const ID5_ID = "id5Id";

// Default Values
export const UNKNOWN_ADVERTISER = "";
export const DEFAULT_THROTTLE_MINUTES = 30;
export const DEFAULT_COOKIE_EXPIRATION_MINUTES = 131040; // 91 days

// Event Types
export const AD_CONVERSION_CLICK_EVENT_TYPE = "advertising.enrichment_ct";
export const AD_CONVERSION_VIEW_EVENT_TYPE = "advertising.enrichment";

// XDM Paths
export const XDM_AD_CLOUD_PATH = "_experience.adloud";
export const XDM_AD_ASSET_REFERENCE = "adAssetReference";
export const XDM_AD_STITCH_DATA = "adStitchData";
export const XDM_AD_ASSET_DATA = "adAssetData";
export const XDM_ADVERTISER = "advertiser";
export const TRACKING_CODE = "trackingCode";
export const TRACKING_IDENTITIES = "trackingIdentities";

// Script URLs
export const ID5_SCRIPT_URL = "https://www.everestjs.net/static/id5-api.js";

// Surfer ID Configuration
export const SURFER_PIXEL_HOST = "pixel.everesttech.net";
export const SURFER_USER_ID = "1";
export const SURFER_TIMEOUT_MS = 5000;
export const SURFER_TRUSTED_ORIGIN = "www.everestjs.net";
export const SURFER_PARAM_KEY = "gsurfer";

// Error Messages
export const ERROR_ID5_PARTNER_ID_REQUIRED = "ID5 partner ID is required";
export const ERROR_RAMP_ID_MAX_RETRIES =
  "Failed to retrieve RampID after maximum retries";

// Log Messages
export const LOG_AD_CONVERSION_START = "Processing ad conversion";
export const LOG_COOKIE_WRITTEN = "Ad tracking data saved";
export const LOG_CONVERSION_TIME_UPDATED = "Conversion timing recorded";
export const LOG_SENDING_CONVERSION = "Submitting ad conversion data";
export const LOG_ALL_IDS_THROTTLED =
  "Ad conversion paused to prevent duplicate submissions";
export const LOG_ALL_IDS_USED = "Ad conversion already processed";
export const LOG_ID_RESOLVED = "Ad identity available";
export const LOG_ERROR_RESOLVING_ID = "Unable to obtain ad identity";
export const LOG_ID_CONVERSION_SUCCESS = "Ad conversion submitted successfully";
export const LOG_AD_CONVERSION_FAILED = "Ad conversion submission failed";
export const DISPLAY_CLICK_COOKIE_KEY = "ev_lcc";
