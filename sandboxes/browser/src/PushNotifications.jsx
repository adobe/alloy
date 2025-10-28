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

export default function PushNotifications() {
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(null);
  const [recheck, setRecheck] = useState(0);

  useAlloy({
    configurations: {
      alloy: {
        orgId: "906E3A095DC834230A495FD6@AdobeOrg",
        datastreamId: "07240eaa-207e-4d84-8a00-48d0e9a90474",
        thirdPartyCookiesEnabled: false,
        targetMigrationEnabled: false,
        clickCollectionEnabled: false,
        personalizationStorageEnabled: false,
        onBeforeEventSend: () => {},

        pushNotifications: {
          appId: "serbanapp",
          trackingDatasetId: "600ab4dd2c6dbf194ada59de",
          vapidPublicKey:
            "BErwge_xSx9XzOxKZxgocoT_jFbV5u1aoWrUjUPCe0KKvE_Ej0dQuNNxwH3wlA7DpVuNyPQJ3zRskD2pUSKRUjQ",
          // "BCVENRqkmTWSZrgUBpZE20F3hiLBKxoSCkm-wF4UA_KYGocR6QEFY34NtENQNmWls6_XGy8BF-Pji-NsL-Rr0I4", // stage
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
              localStorage.clear();
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
