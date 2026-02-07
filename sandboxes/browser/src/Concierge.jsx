import useAlloy from "./helpers/useAlloy";
import includeScript from "./helpers/includeScript";
import { useEffect } from "react";
export default function Concierge() {
  useAlloy({
    configurations: {
      alloy: {
        defaultConsent: "in",
        edgeDomain: "edge-int.adobedc.net",
        edgeBasePath: "ee",
        datastreamId: "6acf9d12-5018-4f84-8224-aac4900782f0",
        orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
        debugEnabled: true,
        idMigrationEnabled: false,
        thirdPartyCookiesEnabled: false,
        prehidingStyle: ".personalization-container { opacity: 0 !important }",
        onBeforeEventSend: (options) => {
          const x = options.xdm;
          const params = new URLSearchParams(window.location.search);
          const titleParam = params.get("title");
          if (titleParam) {
            x.web.webPageDetails.name = titleParam;
          } else {
            // set some hardcoded value to be able to test
            x.web.webPageDetails.name = "ao-test-page";
          }
          return true;
        },
      },
    },
  });

  useEffect(async () => {
    await includeScript("styleConfigurations.js");
    await includeScript(
      "https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js",
    ).then(() => {
      if (window.adobe.concierge.bootstrap) {
        window.adobe.concierge.bootstrap({
          instanceName: "alloy",
          selector: "#brand-concierge-mount",
          stylingConfigurations: window.styleConfiguration,
        });
      }
    });
  }, []);

  return (
    <div>
      <h1>Concierge Demo Page</h1>
      <p>
        This page will be used to test the Concierge feature of the Adobe
        Experience Platform.
      </p>
      <div id="brand-concierge-mount"></div>
    </div>
  );
}
