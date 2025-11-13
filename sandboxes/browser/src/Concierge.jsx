import useAlloy from "./helpers/useAlloy";
import { styles } from "./acom-hackathon";
import includeScript from "./helpers/includeScript";
import { useEffect } from "react";
export default function Concierge() {
  useAlloy({
    configurations: {
      alloy: {
        defaultConsent: "pending",
        edgeDomain: "edge-int.adobedc.net",
        edgeBasePath: "ee",
        datastreamId: "8cf9d0af-8cb7-4664-9705-bcaee2eb4f4c",
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
    await includeScript(
      "https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js",
    ).then(() => {
      window.bc_styles = styles;

      window.dispatchEvent(
        new CustomEvent("alloy-brand-concierge-instance", {
          detail: {
            instanceName: "alloy",
            stylingConfigurations: window.bc_styles,
            selector: "#brand-concierge-mount",
          },
        }),
      );
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
