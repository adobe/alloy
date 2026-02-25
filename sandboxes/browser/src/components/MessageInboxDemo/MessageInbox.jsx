/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations in the License.
*/
import { useEffect, useState, useRef, useCallback } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./MessageInbox.css";
import { getAlloyTestConfigs } from "../utils";
import useAlloy from "../../helpers/useAlloy";

const configKey = localStorage.getItem("iam-configKey") || "stage";
const config = getAlloyTestConfigs();
const { datastreamId, orgId, edgeDomain } = config[configKey];

const SURFACE = "web://aepdemo.com/messageInbox";
const CONTENT_CARD_SCHEMA =
  "https://ns.adobe.com/personalization/message/content-card";
const INBOX_ITEM_SCHEMA = "https://ns.adobe.com/personalization/inbox-item";
const RULESET_ITEM_SCHEMA = "https://ns.adobe.com/personalization/ruleset-item";

const getContentString = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.content != null) return value.content;
  return String(value);
};

const createContentCard = (proposition, item) => {
  const { data = {}, id: itemId } = item;
  const {
    content = {},
    meta = {},
    publishedDate,
    qualifiedDate,
    displayedDate,
  } = data;
  const flat = {
    id: itemId ?? proposition?.id,
    ...content,
    meta,
    qualifiedDate,
    displayedDate,
    publishedDate,
    getProposition: () => proposition,
  };
  if (flat.title != null && typeof flat.title === "object") {
    flat.title = getContentString(flat.title);
  }
  if (flat.body != null && typeof flat.body === "object") {
    flat.body = getContentString(flat.body);
  }
  return flat;
};

const extractContentCards = (propositions) =>
  propositions.reduce((all, prop) => {
    const { items = [] } = prop;
    return [
      ...all,
      ...items
        .filter((item) => item.schema === CONTENT_CARD_SCHEMA)
        .map((item) => createContentCard(prop, item)),
    ];
  }, []);

const extractInboxConfig = (propositions) => {
  for (const prop of propositions) {
    const { items = [] } = prop;
    const inboxItem = items.find((item) => item.schema === INBOX_ITEM_SCHEMA);
    if (inboxItem?.data?.content) return inboxItem.data.content;
  }
  return null;
};

const buildInboxItemProposition = (overrides = {}) => ({
  id: "inbox-config-1",
  scope: SURFACE,
  scopeDetails: {
    decisionProvider: "AJO",
    correlationID: "inbox-demo-0",
    activity: { id: "inbox-demo#config" },
  },
  items: [
    {
      id: "inbox-item-1",
      schema: INBOX_ITEM_SCHEMA,
      data: {
        content: {
          heading: { content: "Message Inbox" },
          layout: { orientation: "vertical" },
          capacity: 20,
          isUnreadEnabled: true,
          emptyStateSettings: {
            message: {
              content: "No messages yet. Send one using the buttons below.",
            },
          },
          ...overrides,
        },
      },
    },
  ],
});

const buildContentCardProposition = ({ id, title, body }) => {
  const ts = Date.now();
  const cardId = `card-${id}-${ts}`;
  return {
    id: `msg-${id}-${ts}`,
    scope: SURFACE,
    scopeDetails: {
      decisionProvider: "AJO",
      correlationID: `msg-${id}-${ts}`,
      activity: { id: `msg-${id}-${ts}#activity` },
    },
    items: [
      {
        id: `ruleset-${id}-${ts}`,
        schema: RULESET_ITEM_SCHEMA,
        data: {
          version: 1,
          rules: [
            {
              condition: {
                definition: {
                  conditions: [
                    {
                      definition: {
                        key: "~type",
                        matcher: "eq",
                        values: ["always"],
                      },
                      type: "matcher",
                    },
                  ],
                  logic: "and",
                },
                type: "group",
              },
              consequences: [
                {
                  type: "schema",
                  detail: {
                    schema: CONTENT_CARD_SCHEMA,
                    id: cardId,
                    data: {
                      content: {
                        title: { content: title },
                        body: { content: body },
                      },
                      contentType: "application/json",
                      publishedDate: Date.now(),
                      expiryDate: Math.floor(Date.now() / 1000) + 86400 * 30,
                      meta: { surface: SURFACE },
                    },
                  },
                  id: cardId,
                },
              ],
            },
          ],
        },
      },
    ],
  };
};

const buildHandle = (propositions) => ({
  requestId: `mock-${Date.now()}`,
  handle: [
    {
      type: "personalization:decisions",
      eventIndex: 0,
      payload: propositions,
    },
  ],
});

const INITIAL_INBOX_RESPONSE = buildHandle([buildInboxItemProposition()]);

const TOAST_DURATION_MS = 4000;

const MESSAGE_TEMPLATES = [
  {
    id: "welcome",
    title: "Welcome",
    body: "Thanks for visiting. Here’s a quick tip: open the Message Inbox to see notifications from this demo.",
  },
  {
    id: "promo",
    title: "Limited-time offer",
    body: "Get 20% off your next order. Use code DEMO20 at checkout.",
  },
  {
    id: "alert",
    title: "Reminder",
    body: "Your session will expire in 15 minutes. Save your work if needed.",
  },
  {
    id: "update",
    title: "Update",
    body: "We’ve added a new Message Inbox demo. Check it out from the sidebar.",
  },
];

export default function MessageInbox() {
  const [messages, setMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [inboxConfig, setInboxConfig] = useState(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const unsubscribeRef = useRef(null);
  const toastTimeoutsRef = useRef({});
  const dismissToastRef = useRef(() => {});
  const messagesRef = useRef([]);
  messagesRef.current = messages;

  useAlloy({
    configurations: {
      alloy: {
        defaultConsent: "in",
        datastreamId,
        orgId,
        edgeDomain,
        thirdPartyCookiesEnabled: false,
        targetMigrationEnabled: false,
        personalizationStorageEnabled: true,
        debugEnabled: true,
      },
    },
  });

  useEffect(() => {
    if (!window.alloy) return;

    const sub = window.alloy("subscribeRulesetItems", {
      surfaces: [SURFACE],
      schemas: [CONTENT_CARD_SCHEMA, INBOX_ITEM_SCHEMA],
      callback: (result, collectEvent) => {
        const { propositions = [] } = result;
        const newCards = extractContentCards(propositions);
        const configFromPayload = extractInboxConfig(propositions);

        const prev = messagesRef.current;
        const existingIds = new Set(prev.map((m) => m.id).filter(Boolean));
        const toAdd = newCards
          .filter((m) => m.id == null || !existingIds.has(m.id))
          .map((m) => ({ ...m, read: false }));

        if (toAdd.length > 0) {
          setMessages((p) => [...p, ...toAdd]);
          setToasts((t) => [...t, ...toAdd]);
          toAdd.forEach((card) => {
            const timeoutId = setTimeout(() => {
              dismissToastRef.current(card.id);
            }, TOAST_DURATION_MS);
            toastTimeoutsRef.current[card.id] = timeoutId;
          });
        }
        if (configFromPayload) setInboxConfig(configFromPayload);
        collectEvent("display", propositions);
      },
    });

    unsubscribeRef.current = sub;

    window.alloy("applyResponse", {
      renderDecisions: true,
      responseBody: INITIAL_INBOX_RESPONSE,
      personalization: {
        decisionContext: { "~type": "always" },
      },
    });

    return () => {
      sub.then((r) => r?.unsubscribe?.());
      Object.values(toastTimeoutsRef.current).forEach(clearTimeout);
      toastTimeoutsRef.current = {};
    };
  }, []);

  const dismissToast = useCallback((messageId) => {
    const timeoutId = toastTimeoutsRef.current[messageId];
    if (timeoutId) clearTimeout(timeoutId);
    delete toastTimeoutsRef.current[messageId];
    setToasts((prev) => prev.filter((t) => t.id !== messageId));
  }, []);

  dismissToastRef.current = dismissToast;

  const sendMessage = (template) => {
    if (!window.alloy) return;
    const proposition = buildContentCardProposition(template);
    window.alloy("applyResponse", {
      renderDecisions: true,
      responseBody: buildHandle([proposition]),
      personalization: {
        decisionContext: { "~type": "always" },
        surfaces: [SURFACE],
      },
    });
  };

  const markMessageRead = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m)),
    );
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const heading =
    inboxConfig?.heading != null
      ? getContentString(inboxConfig.heading)
      : "Message Inbox";
  const emptyMessage =
    inboxConfig?.emptyStateSettings?.message != null
      ? getContentString(inboxConfig.emptyStateSettings.message)
      : "No messages yet. Send one using the buttons below.";

  return (
    <div className="message-inbox-page">
      <ContentSecurityPolicy />
      <h1 className="message-inbox-page__title">Message Inbox</h1>
      <p className="message-inbox-page__intro">
        This page demonstrates a &quot;message inbox&quot; fed by content cards
        and configured by an inbox-item. Open the inbox to see messages from
        this session; use the buttons below to add mock messages.
      </p>

      <button
        type="button"
        className="message-inbox-trigger"
        onClick={() => setInboxOpen(true)}
        aria-label="Open message inbox"
      >
        Open Inbox
        {unreadCount > 0 && (
          <span className="message-inbox-trigger__badge">{unreadCount}</span>
        )}
      </button>

      <div className="message-inbox-toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="message-inbox-toast"
            role="status"
            onClick={() => {
              markMessageRead(toast.id);
              dismissToast(toast.id);
            }}
          >
            <p className="message-inbox-toast__title">{toast.title}</p>
            <p className="message-inbox-toast__body">{toast.body}</p>
          </div>
        ))}
      </div>

      <section className="send-messages">
        <h2 className="send-messages__title">Send a message</h2>
        <p className="send-messages__hint">
          Each button adds a new message to the inbox for this session (like
          notifications that would come from the SDK when content cards are
          returned).
        </p>
        <div className="send-messages__buttons">
          {MESSAGE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="send-messages__btn"
              onClick={() => sendMessage(t)}
            >
              {t.title}
            </button>
          ))}
        </div>
      </section>

      {inboxOpen && (
        <>
          <div
            className="message-inbox-overlay"
            role="presentation"
            onClick={() => setInboxOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setInboxOpen(false)}
          />
          <aside
            className="message-inbox-sidebar"
            role="dialog"
            aria-label={heading}
          >
            <div className="message-inbox-sidebar__header">
              <h2 className="message-inbox-sidebar__heading">{heading}</h2>
              <button
                type="button"
                className="message-inbox-sidebar__close"
                onClick={() => setInboxOpen(false)}
                aria-label="Close inbox"
              >
                ×
              </button>
            </div>
            <div className="message-inbox-sidebar__list">
              {messages.length === 0 ? (
                <p className="message-inbox-sidebar__empty">{emptyMessage}</p>
              ) : (
                messages
                  .slice()
                  .reverse()
                  .map((msg, idx) => (
                    <div
                      key={msg.id ?? idx}
                      className={`inbox-message ${msg.read ? "inbox-message--read" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => msg.id && markMessageRead(msg.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          msg.id && markMessageRead(msg.id);
                        }
                      }}
                    >
                      <p className="inbox-message__title">{msg.title}</p>
                      <p className="inbox-message__body">{msg.body}</p>
                      <p className="inbox-message__meta">
                        {msg.publishedDate
                          ? new Date(msg.publishedDate).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
