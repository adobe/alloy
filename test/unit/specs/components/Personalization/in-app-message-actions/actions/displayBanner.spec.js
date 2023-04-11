import displayBanner from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayBanner";
import { createNode } from "../../../../../../../src/utils/dom";
import { DIV } from "../../../../../../../src/constants/tagName";

describe("Personalization::IAM:banner", () => {
  it("inserts banner into dom", async () => {
    const something = createNode(
      DIV,
      { className: "something" },
      {
        innerHTML:
          "<p>Amet cillum consectetur elit cupidatat voluptate nisi duis et occaecat enim pariatur.</p>"
      }
    );

    document.body.prepend(something);

    await displayBanner({
      type: "banner",
      position: "top",
      closeButton: false,
      background: "#00a0fe",
      content:
        "<span style='color: white;'>FLASH SALE!! 50% off everything, 24 hours only!</span>"
    });

    const banner = document.querySelector("div#alloy-messaging-banner");
    const bannerStyle = document.querySelector(
      "style#alloy-messaging-banner-styles"
    );

    expect(banner).not.toBeNull();
    expect(bannerStyle).not.toBeNull();

    expect(banner.parentNode).toEqual(document.body);
    expect(bannerStyle.parentNode).toEqual(document.head);

    expect(banner.previousElementSibling).toBeNull();
    expect(banner.nextElementSibling).toEqual(something);
  });
});
