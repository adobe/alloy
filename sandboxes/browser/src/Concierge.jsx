import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import { styles } from "./acom-hackathon";
import includeScript from "./helpers/includeScript";
export default function Concierge() {
  useAlloy({
    configurations: {
      alloy: {
        defaultConsent: "in",
        edgeDomain: "edge.adobedc.net",
        edgeBasePath: "ee",
        datastreamId: "913eac4d-900b-45e8-9ee7-306216765cd2",
        orgId: "9E1005A551ED61CA0A490D45@AdobeOrg",
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
    await includeScript("main.js").then(() => {
      window.bc_styles = styles;
    });
  }, []);

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Concierge Demo Page</h1>
      <p>
        This page will be used to test the Concierge feature of the Adobe
        Experience Platform.
      </p>
      <div id="brand-concierge-mount"></div>
    </div>
  );
}
