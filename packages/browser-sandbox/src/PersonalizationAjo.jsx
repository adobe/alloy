import React from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

export default function PersonalizationAjo() {
  useAlloy({
    instanceNames: ["cjmProd"],
    configurations: {
      cjmProd: {
        datastreamId: "3e808bee-74f7-468f-be1d-99b498f36fa8:prod",
        orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
        thirdPartyCookiesEnabled: false,
        clickCollectionEnabled: false,
      },
    },
  });
  useSendPageViewEvent({ renderDecisions: true, instanceName: "cjmProd" });

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>AJO Personalization</h1>
      <p>
        This page tests rendering of activities using an AJO surface. If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </p>
      <div
        style={{ border: "1px solid red" }}
        className="personalization-container-ajo"
      >
        This is the AJO personalization placeholder. Personalized content has
        not been loaded.
      </div>
    </div>
  );
}
