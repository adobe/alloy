# Advertising Component Functional Tests

This directory contains functional tests for the Adobe Experience Platform Web SDK (Alloy) Advertising component. These tests validate advertising conversion tracking functionality including click-through and view-through conversions.

## Test Coverage

### Click-Through Conversions
Tests for advertising conversions triggered by URL parameters:

- **C300001_ClickThroughWithSkwcid.js**: Tests conversion with `s_kwcid` parameter (search campaigns)
- **C300002_ClickThroughWithEfid.js**: Tests conversion with `ef_id` parameter (display campaigns)  
- **C300003_ClickThroughWithBothParams.js**: Tests conversion with both parameters

### View-Through Conversions
Tests for advertising conversions based on available advertising IDs:

- **C300004_ViewThroughWithAdvertisingIds.js**: Tests conversion with multiple advertising IDs available
- **C300005_ViewThroughPartialIds.js**: Tests graceful handling when only some IDs are available

## Configuration Requirements

### Configuration

The tests are configured with the following values:

- **Test Case IDs**: C300001 through C300005
- **Advertiser IDs**: ["83565", "83567", "83569"]
- **ID5 Partner ID**: "1650" (used in view-through tests)
- **RampID JS Path**: "https://ats-wrapper.privacymanager.io/ats-modules/db58949f-d696-469b-a8ac-a04382bc5183/ats.js"

### Example Configuration

```javascript
const advertisingConfig = {
  advertising: {
    advertiserSettings: [
      { advertiserId: "12345", enabled: true },
      { advertiserId: "67890", enabled: false },
      { advertiserId: "11111", enabled: true },
    ], // Your test advertiser settings
    id5PartnerId: "your-test-partner-id",
    rampIdJSPath: "/path/to/test/ramp-id.js",
  },
};
```

## Expected Network Requests

### Click-Through Conversion Payload
```json
{
  "events": [{
    "xdm": {
      "_experience": {
        "adcloud": {
          "eventType": "advertising.clickThrough",
          "campaign": {
              "sampleGroupId": "s_kwcid_value",
              "experimentId": "ef_id_value", 
              "accountId": "advertiser1, advertiser2"
          }
        }
      }
    }
  }]
}
```

### View-Through Conversion Payload
```json
{
  "events": [{
    "query": {
      "advertising": {
        "conversion": {
          "lastDisplayClick": "display_click_id",
          "stitchIds": {
            "surferId": "surfer_id_value",
            "id5": "id5_value", 
            "rampIDEnv": "ramp_id_value"
          },
          "advIds": "advertiser1, advertiser2"
        }
      }
    }
  }]
}
```

## Test Helpers

The `advertising.js` helper file provides utility functions:

- `findClickThroughRequest()`: Locates click-through conversion requests
- `findViewThroughRequests()`: Locates view-through conversion requests  
- `validateClickThroughRequest()`: Validates click-through request structure
- `validateViewThroughRequest()`: Validates view-through request structure
- `validateNoAdvertisingRequests()`: Confirms no advertising requests were sent

## Running the Tests

```bash
# Run all advertising tests
npm test -- --spec="test/functional/specs/Advertising/*.js"

# Run specific test
npm test -- --spec="test/functional/specs/Advertising/C300001_ClickThroughWithSkwcid.js"
```

## Troubleshooting

### Common Issues

1. **No conversion requests found**: 
   - Verify advertiser IDs are configured correctly
   - Check that URL parameters are properly formatted
   - Ensure Adobe Experience Platform configuration supports advertising

2. **Missing advertising IDs in view-through tests**:
   - Verify ID5 partner ID configuration
   - Check RampID JavaScript path
   - Some IDs may not be available in test environments

3. **Test timeouts**:
   - Advertising ID collection can be asynchronous
   - View-through conversions may have delays for ID resolution

### Debug Tips

- Enable debug logging with `debugEnabled: true` in config
- Check network requests in browser developer tools
- Verify test page loads correctly with advertising parameters
- Confirm Adobe Experience Platform datastream configuration

## Notes

- Tests use the existing TestCafe framework and follow established patterns
- Network requests are captured and validated using the networkLogger helper
- Tests are designed to be independent and can run in any order
- Some advertising IDs may not be available in test environments (this is expected behavior) 
