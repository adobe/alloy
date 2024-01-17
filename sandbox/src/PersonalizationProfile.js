import React from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

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
      <Heading level={1}>Personalization Profile</Heading>
      <div id="profile-based-offer">
        This will be replaced by an offer based on a profile attribute.
      </div>
    </div>
  );
}
