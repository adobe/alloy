import React, { useState, useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import NotificationPermissionsPanel from "./components/PushNotifications/NotificationPermissionsPanel";
import useAlloy from "./helpers/useAlloy";
import {
  isServiceWorkerRegistered,
  registerServiceWorker,
  unregisterServiceWorker,
} from "./components/PushNotifications/utils/serviceWorkerUtils";

const sendPushSubscription = () => {
  window.alloy("sendPushSubscription");
};

export default function Home() {
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(null);
  const [recheck, setRecheck] = useState(0);

  useAlloy({
    configurations: {
      alloy: {
        orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
        datastreamId: "5aba15dc-b57b-41eb-99a5-5b7b083f2120",
        thirdPartyCookiesEnabled: false,
        targetMigrationEnabled: false,
        clickCollectionEnabled: false,
        personalizationStorageEnabled: false,
        edgeDomain: "edge-int.adobedc.net",
        onBeforeEventSend: () => {},

        pushNotifications: {
          appId: "test.mobile.webPush",
          trackingDatasetId: "628c1b9a80e2a21b9983b019",
          vapidPublicKey:
            // "BBNXFX_qxm8d7ry08dh0qt-CLMdiXamv7KlvLz0p4nCTxW3ePvrMb1x_VL-tg4TINPPZaJoNX4FQvthuAOR1VuI",
            // "BHeILyEYArRYKNvme32HbtARmFs5WlHb1PWKG_JfGQpAWv6L2Gc1Jzo9NvVGvVgHk7T-tU5VnXkq860L8bpdMzE",
            "BCVENRqkmTWSZrgUBpZE20F3hiLBKxoSCkm-wF4UA_KYGocR6QEFY34NtENQNmWls6_XGy8BF-Pji-NsL-Rr0I4",
        },
      },
    },
  });

  useEffect(() => {
    const setRecheckServiceWorkerStatus = async () => {
      try {
        const isRegistered = await isServiceWorkerRegistered();
        setServiceWorkerRegistered(isRegistered);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error checking service worker status:", error);
      }
    };

    setRecheckServiceWorkerStatus();
  }, [recheck]);

  return (
    <div>
      <ContentSecurityPolicy />
      <NotificationPermissionsPanel />
      <h1>Push Notifications</h1>
      <section>
        <h2></h2>
        <div>
          {serviceWorkerRegistered !== null && serviceWorkerRegistered && (
            <button
              onClick={async () => {
                await unregisterServiceWorker();
                setRecheck((v) => v + 1);
              }}
            >
              Unregister Service Worker
            </button>
          )}

          {serviceWorkerRegistered !== null && !serviceWorkerRegistered && (
            <button
              onClick={async () => {
                await registerServiceWorker();
                setRecheck((v) => v + 1);
              }}
            >
              Register Service Worker
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem(
                "com.adobe.alloy.97D1F3F459CE0AD80A495CBE_AdobeOrg.pushNotifications.subscriptionDetails",
              );
            }}
          >
            Clear subscription cache
          </button>

          <button onClick={sendPushSubscription}>Send Push Subscription</button>
        </div>
      </section>
    </div>
  );
}
