import { useEffect, useState } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import getUrlParameter from "./helpers/getUrlParameter";

const ADVERTISING_COOKIE =
  "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_advertising";
const advertisingEnabled = getUrlParameter("advertisingEnabled") !== "false";
const hasClickThroughParams = Boolean(
  getUrlParameter("s_kwcid") || getUrlParameter("ef_id"),
);

const urlWith = (updates) => {
  const params = new URLSearchParams(window.location.search);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  const search = params.toString();
  return `${window.location.pathname}${search ? `?${search}` : ""}`;
};

const getAdvertisingCookie = () =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ADVERTISING_COOKIE}=`));

const describeRequest = (payload = {}) =>
  (payload.events || []).map((event) => ({
    eventType: event.xdm?.eventType,
    hasAdvertisingQuery: Boolean(event.query?.advertising),
    hasAdCloudXdm: Boolean(event.xdm?._experience?.adcloud),
  }));

export default function Advertising() {
  const [entries, setEntries] = useState([]);
  const log = (message) => {
    // eslint-disable-next-line no-console
    console.log(message);
    setEntries((previous) => [...previous, message]);
  };

  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    window.__alloyMonitors = [
      {
        onInstanceConfigured({ config }) {
          log(
            `configured: advertising = ${JSON.stringify(config.advertising)}`,
          );
        },
        onBeforeNetworkRequest({ payload }) {
          log(`request: ${JSON.stringify(describeRequest(payload))}`);
        },
        onNetworkResponse() {
          log(
            `advertising cookie: ${getAdvertisingCookie() ? "present" : "none"}`,
          );
        },
      },
    ];
  }, []);

  useAlloy({
    options: { keepExistingMonitors: true },
    configurations: {
      alloy: {
        advertising: {
          enabled: advertisingEnabled,
          dspEnabled: true,
          advertiserSettings: [{ advertiserId: "83565", enabled: true }],
          id5PartnerId: "1650",
          rampIdJSPath:
            "https://ats-wrapper.privacymanager.io/ats-modules/69584196-4cc8-4859-ae5e-7441332d2695/ats.js",
        },
      },
    },
  });

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Advertising</h1>
      <table className="configuration">
        <tbody>
          <tr>
            <td>advertising.enabled</td>
            <td>{String(advertisingEnabled)}</td>
            <td>
              <a
                href={urlWith({
                  advertisingEnabled: advertisingEnabled ? "false" : undefined,
                })}
              >
                {advertisingEnabled ? "Disable" : "Enable"}
              </a>
            </td>
          </tr>
          <tr>
            <td>Click-through params (s_kwcid, ef_id)</td>
            <td>{hasClickThroughParams ? "present" : "none"}</td>
            <td>
              <a
                href={
                  hasClickThroughParams
                    ? urlWith({ s_kwcid: undefined, ef_id: undefined })
                    : urlWith({ s_kwcid: "AL!sandbox", ef_id: "sandbox_efid" })
                }
              >
                {hasClickThroughParams ? "Remove" : "Add"}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <section>
        <div style={{ margin: "20px 0" }}>
          <button
            id="sendEventBtn"
            onClick={() => {
              window.alloy("sendEvent", {
                xdm: { eventType: "web.webpagedetails.pageViews" },
                advertising: { handleAdvertisingData: "auto" },
              });
            }}
          >
            Send event (handleAdvertisingData: auto)
          </button>
        </div>
        <div
          id="output"
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            minHeight: "200px",
            fontFamily: "monospace",
          }}
        >
          {entries.map((entry, index) => (
            <div key={index}>{entry}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
