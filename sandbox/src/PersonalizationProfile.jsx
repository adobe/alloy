import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import sendPageViewEvent from "./helpers/sendPageViewEvent";
import configureAlloy from "./helpers/configureAlloy";
import setupAlloy from "./helpers/setupAlloy";

export default function Personalization() {
  useEffect(() => {
    setupAlloy();
    configureAlloy();
    sendPageViewEvent({
      renderDecisions: true,
      data: {
        __adobe: {
          target: {
            "profile.favoriteColor": "Black",
          },
        },
      },
    });
  }, []);
  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization Profile</h1>
      <div id="profile-based-offer">
        This will be replaced by an offer based on a profile attribute.
      </div>
    </div>
  );
}
