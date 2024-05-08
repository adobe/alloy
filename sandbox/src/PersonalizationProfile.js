import React from "react.js";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy.js";
import useSendPageViewEvent from "./useSendPageViewEvent.js";

export default function Personalization() {
  useSendPageViewEvent({
    data: {
      __adobe: {
        target: {
          "profile.favoriteColor": "Black"
        }
      }
    }
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
