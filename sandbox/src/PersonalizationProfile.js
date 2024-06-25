import React from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function Personalization() {
  useSendPageViewEvent({
    data: {
      __adobe: {
        target: {
          "profile.favoriteColor": "Black",
        },
      },
    },
  });

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
