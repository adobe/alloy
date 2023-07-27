import { IN_APP_MESSAGE } from "../../Personalization/constants/schema";
import {
  IAM_ACTION_TYPE_BANNER,
  IAM_ACTION_TYPE_CUSTOM,
  IAM_ACTION_TYPE_FULLSCREEN,
  IAM_ACTION_TYPE_MODAL
} from "../../Personalization/in-app-message-actions/initMessagingActionsModules";

const deduceType = html => {
  if (html.includes("banner")) {
    return IAM_ACTION_TYPE_BANNER;
  }

  if (html.includes("modal")) {
    return IAM_ACTION_TYPE_MODAL;
  }

  if (html.includes("fullscreen")) {
    return IAM_ACTION_TYPE_FULLSCREEN;
  }

  return IAM_ACTION_TYPE_CUSTOM;
};

export default (id, type, detail) => {
  const { html, mobileParameters } = detail;

  const webParameters = { info: "this is a placeholder" };

  return {
    schema: IN_APP_MESSAGE,
    data: {
      type: deduceType(html, mobileParameters),
      mobileParameters,
      webParameters,
      content: html,
      contentType: "text/html"
    },
    id
  };
};
