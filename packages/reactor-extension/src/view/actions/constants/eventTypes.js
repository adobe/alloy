/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import mediaEventTypes from "./mediaEventTypes";

export default {
  "advertising.completes": "Advertising Completes",
  "advertising.timePlayed": "Advertising Time Played",
  "advertising.federated": "Advertising Federated",
  "advertising.clicks": "Advertising Clicks",
  "advertising.conversions": "Advertising Conversions",
  "advertising.firstQuartiles": "Advertising First Quartiles",
  "advertising.impressions": "Advertising Impressions",
  "advertising.midpoints": "Advertising Midpoints",
  "advertising.starts": "Advertising Starts",
  "advertising.thirdQuartiles": "Advertising Third Quartiles",
  "application.close": "Application Close",
  "application.launch": "Application Launch",
  "web.webpagedetails.pageViews": "Web Webpagedetails Page Views",
  "web.webinteraction.linkClicks": "Web Webinteraction Link Clicks",
  "web.formFilledOut": "Web Form Filled Out",
  "commerce.checkouts": "Commerce Checkouts",
  "commerce.productListAdds": "Commerce Product List (Cart) Adds",
  "commerce.productListOpens": "Commerce Product List (Cart) Opens",
  "commerce.productListRemovals": "Commerce Product List (Cart) Removals",
  "commerce.productListReopens": "Commerce Product List (Cart) Reopens",
  "commerce.productListViews": "Commerce Product List (Cart) Views",
  "commerce.productViews": "Commerce Product (Cart) Views",
  "commerce.purchases": "Commerce Purchases",
  "commerce.saveForLaters": "Commerce Save For Laters",
  "commerce.backofficeOrderPlaced": "Commerce Backoffice Order Placed",
  "commerce.backofficeOrderCancelled": "Commerce Backoffice Order Cancelled",
  "commerce.backofficeOrderItemsShipped":
    "Commerce Backoffice OrderItems Shipped",
  "commerce.backofficeCreditMemoIssued":
    "Commerce Backoffice CreditMemo Issued",
  "commerce.backofficeShipmentCompleted":
    "Commerce Backoffice Shipment Completed",
  "decisioning.propositionDisplay": "Decisioning Proposition Display",
  "decisioning.propositionInteract": "Decisioning Proposition Interact",
  "decisioning.propositionSend": "Decisioning Proposition Send",
  "decisioning.propositionDismiss": "Decisioning Proposition Dismiss",
  "decisioning.propositionTrigger": "Decisioning Proposition Trigger",
  "decisioning.propositionFetch": "Decisioning Proposition Fetch",
  "delivery.feedback": "Delivery Feedback",
  "message.feedback": "Message Feedback",
  "message.tracking": "Message Tracking",
  "pushTracking.applicationOpened": "Push Tracking Application Opened",
  "pushTracking.customAction": "Push Tracking Custom Action",
  "listOperation.removeFromList": "List Operation Remove From List",
  "listOperation.addToList": "List Operation Add To List",
  "leadOperation.scoreChanged": "Lead Operation Score Changed",
  "leadOperation.revenueStageChanged": "Lead Operation Revenue Stage changed",
  "leadOperation.statusInCampaignProgressionChanged":
    "Lead Operation Status In Campaign Progression Changed",
  "leadOperation.interestingMoment": "Lead Operation Interesting Moment",
  "leadOperation.newLead": "Lead Operation New Lead",
  "leadOperation.convertLead": "Lead Operation Convert Lead",
  "leadOperation.callWebhook": "Lead Operation Call Webhook",
  "leadOperation.changeEngagementCampaignCadence":
    "Change Engagement Campaign Cadence",
  "leadOperation.addToCampaign": "Lead Operation Add To Campaign",
  "leadOperation.changeCampaignStream": "Lead Operation Change Campaign Stream",
  "leadOperation.mergeLeads": "Lead Operation Merge Leads",
  "directMarketing.emailBounced": "Direct Marketing Email Bounced",
  "directMarketing.emailBouncedSoft": "Direct Marketing Email Bounced Soft",
  "directMarketing.emailDelivered": "Direct Marketing Email Delivered",
  "directMarketing.emailUnsubscribed": "Direct Marketing Email Unsubscribed",
  "directMarketing.emailOpened": "Direct Marketing Email Opened",
  "directMarketing.emailClicked": "Direct Marketing Email Clicked",
  "directMarketing.emailSent": "Direct Marketing Email Sent",
  "opportunityEvent.removeFromOpportunity":
    "Opportunity Event Remove From Opportunity",
  "opportunityEvent.addToOpportunity": "Opportunity Event Add To Opportunity",
  "opportunityEvent.opportunityUpdated":
    "Opportunity Event Opportunity Updated",
  "inappmessageTracking.dismiss": "inapp message was dimissed",
  "inappmessageTracking.display": "inapp message was displayed",
  "inappmessageTracking.interact": "inapp message was interacted with",
  "media.reporting.sessionStart": "Media reporting sessionStart",
  "media.reporting.sessionClose": "Media reporting sessionClose",
  "media.reporting.adStart": "Media reporting adStart",
  "media.reporting.adClose": "Media reporting adClose",
  "media.reporting.chapterClose": "Media reporting chapterClose",
  "location.entry": "Location entry",
  "location.exit": "Location exit",
  ...mediaEventTypes,
};
