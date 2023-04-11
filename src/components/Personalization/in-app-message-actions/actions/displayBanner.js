import { addStyle, removeElements } from "../utils";

const STYLE_TAG_ID = "alloy-messaging-banner-styles";
const ELEMENT_TAG_ID = "alloy-messaging-banner";
const BANNER_CSS_CLASSNAME = "alloy-banner";

const showBanner = ({ background, content }) => {
  removeElements(BANNER_CSS_CLASSNAME);

  addStyle(
    STYLE_TAG_ID,
    `.alloy-banner {
        display: flex;
        justify-content: center;
        padding: 10px;
        background: ${background};
      }
      .alloy-banner-content {
      }`
  );

  const banner = document.createElement("div");
  banner.id = ELEMENT_TAG_ID;
  banner.className = BANNER_CSS_CLASSNAME;

  const bannerContent = document.createElement("div");
  bannerContent.className = "alloy-banner-content";
  bannerContent.innerHTML = content;
  banner.appendChild(bannerContent);

  document.body.prepend(banner);
};

export default settings => {
  return new Promise(resolve => {
    const { meta } = settings;

    showBanner(settings);

    resolve({ meta });
  });
};
