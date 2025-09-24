/* eslint-disable compat/compat */

export const isServiceWorkerRegistered = async () =>
  (await navigator.serviceWorker.getRegistration()) != null;

export const registerServiceWorker = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser.");
    }

    if (!("PushManager" in window)) {
      throw new Error("Push notifications are not supported in this browser.");
    }

    const registration = await navigator.serviceWorker.register(
      "/alloyServiceWorker.js",
      { scope: "/pushNotifications" },
    );

    return registration;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Push Notifications Service Worker registration failed: ", e);
  }
};

export const unregisterServiceWorker = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser.");
    }

    if (!("PushManager" in window)) {
      throw new Error("Push notifications are not supported in this browser.");
    }

    const registration = await navigator.serviceWorker.getRegistration(
      "/alloyServiceWorker.js",
    );
    if (registration) {
      const r = await registration.unregister();
      if (!r) {
        throw new Error("Service worker was not unregistered");
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Push Notifications Service Worker registration failed: ", e);
  }
};

export const getPushSubscriptionDetails = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser.");
    }

    if (!("PushManager" in window)) {
      throw new Error("Push notifications are not supported in this browser.");
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error("Service worker is not registered.");
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return null;
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey("p256dh")
          ? btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("p256dh")),
              ),
            )
          : null,
        auth: subscription.getKey("auth")
          ? btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("auth")),
              ),
            )
          : null,
      },
      expirationTime: subscription.expirationTime,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to get push subscription details: ", e);
    throw e;
  }
};
