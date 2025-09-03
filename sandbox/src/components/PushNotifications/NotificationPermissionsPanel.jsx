import React, { useState } from "react";
import "./NotificationPermissionsPanel.css";

const NotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermissions = async () => {
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    if (newPermission === "granted") {
      new Notification(
        "You successfully granted permsissions to Push notifications!",
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="notification-banner">
      <div>
        <div className="notification-text">
          {!("Notification" in window) &&
            "This browser does not support desktop notifications."}

          {permission === "default" && (
            <>
              <strong>Would you like to receive push notifications?</strong>
              <button
                className="notification-link positive"
                onClick={requestPermissions}
              >
                Sure
              </button>
              <button
                className="notification-link negative"
                onClick={() => setPermission("denied")}
              >
                Nope
              </button>
            </>
          )}

          {permission !== "default" && (
            <>
              <div>
                You have already chosen your notification preference. Permission
                value: <strong>{permission}</strong>.
              </div>
              <div>
                For Chrome open the following link in a new tab:{" "}
                <strong>
                  chrome://settings/content/notifications?search=notifications
                </strong>
                <button
                  className="notification-link"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "chrome://settings/content/notifications?search=notifications",
                    );
                  }}
                >
                  Copy
                </button>
              </div>
              <div>
                For Edge open the following link in a new tab:{" "}
                <strong>
                  edge://settings/content/notifications?search=notifications
                </strong>
                <button
                  className="notification-link"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "edge://settings/content/notifications?search=notifications",
                    );
                  }}
                >
                  Copy
                </button>
              </div>

              <div>
                For Safari, go to{" "}
                <strong>Preferences &gt; Websites &gt; Notifications</strong>{" "}
                and manually remove each website entry that appears there
              </div>

              <div>
                For Firefox, go to{" "}
                <strong>
                  Settings &gt; Privacy & Security &gt; Permissions &gt;
                  Notifications &gt; Settings
                </strong>{" "}
                and manually remove each website entry that appears there
              </div>
            </>
          )}
        </div>
      </div>
      <button
        className="close-button"
        onClick={() => setIsVisible(false)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default NotificationBanner;
