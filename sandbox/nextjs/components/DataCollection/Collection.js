import React, { useEffect, useState } from "react";

import appStyles from "../Layout/Layout.module.scss";
import cx from "classnames";

import Tabs from "../Tabs/Tabs";
import { api } from "../../services/api";
import CodeBlock from "../CodeBlock/CodeBlock";

const DataCollection = () => {
  const [activeTab, setActiveTab] = useState("description");
  const [response, setResponse] = useState(null);

  const [alloyKey, setAlloyKey] = useState(null);
  const [alloyKeyError, setAlloyKeyError] = useState(false);

  const [subresources, setSubresources] = useState([]);

  const [loading, setLoading] = useState(false);

  const makeAPICall = async e => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (null === alloyKey) {
      return setAlloyKeyError(true);
    } else {
      setAlloyKeyError(false);
    }

    setLoading(true);

    const data = await api("/endpoint/", {
      alloyKey,
      subresources
    });

    setResponse(data);
  };

  useEffect(() => {
    if (response) {
      setLoading(false);
    }
  }, [response]);

  const updateInput = (cb, val) => {
    return cb(val);
  };

  const updateSubresources = key => {
    const idx = subresources.findIndex(k => k === key);

    if (idx >= 0) {
      const newSubs = subresources;
      newSubs.splice(idx, 1);
      setSubresources([...newSubs]);
    } else {
      setSubresources([...subresources, key]);
    }
  };

  return (
    <>
      <h2 className={appStyles.public}>Automatically collected information</h2>
      <p>
        The Adobe Experience Platform Web SDK collects a number of pieces of
        information automatically without any special configuration. However,
        this information can be disabled if needed using the context option in
        the configure command. See Configuring the SDK. Below is a list of those
        pieces of information. The name in parentheses indicates the string to
        use when configuring the context.
      </p>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div>
        <h3>
          {activeTab === "description"
            ? "There are many options that can be set during configuration. All options can be found below, grouped by category."
            : "Try It Out"}
        </h3>
        <form onSubmit={e => makeAPICall(e)}>
          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>General options</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>edgeConfigId</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Your assigned configuration ID, which links the SDK to the
                appropriate accounts and configuration. When configuring
                multiple instances within a single page, you must configure a
                different edgeConfigId for each instance.
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>context</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Indicates which context categories to collect automatically as
                described in Automatic Information. If this configuration is not
                specified, all categories are used by default.
              </div>
            </div>

            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>debugEnable</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e => updateSubresources("debugEnabled")}
                  ></input>
                </div>
              )}
              <div>
                Indicates whether debugging is enabled. Setting this config to
                true enables the following features:
              </div>
            </div>

            <div className={appStyles.row}>
              <div className={cx(appStyles.arg, appStyles.required)}>
                edgeDomain
              </div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Populate this field with your first-party domain. For more
                details, please see the documentation. The domain is similar to
                data.customerdomain.com for a website at www.customerdomain.com.{" "}
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg, appStyles.required)}>orgId</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Your assigned Experience Cloud organization ID. When configuring
                multiple instances within a page, you must configure a different
                orgId for each instance.
              </div>
            </div>
          </div>

          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>Data collection</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>clickCollectionEnabled</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e => updateSubresources("clickCollectionEnabled")}
                  ></input>
                </div>
              )}
              <div>
                Indicates whether data associated with link clicks are
                automatically collected. See Automatic Link Tracking for more
                information. Links are also labeled as download links if they
                include a download attribute or if the link ends with a file
                extension. Download link qualifiers can be configured with a
                regular expression. The default value is
                "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$"
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>onBeforeEventSend</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Configure a callback that is called for every event just before
                it is sent. An object with the field xdm is sent in to the
                callback. To change what is sent, modify the xdm object. Inside
                the callback, the xdm object already has the data passed in the
                event command, and the automatically collected information. For
                more information on the timing of this callback and an example,
                see Modifying Events Globally.
              </div>
            </div>
          </div>

          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>Privacy options</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>defaultConsent</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Sets the user’s default consent. Use this setting when there is
                no consent preference already saved for the user. The other
                valid values are "pending" and "out". This default value is not
                persisted to the user’s profile. The user’s profile is updated
                only when setConsent is called.
              </div>
            </div>
          </div>

          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>Personalization options</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>prehidingStyle</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={cx(appStyles.value, {
                      [appStyles.inputErr]: alloyKeyError
                    })}
                    type="text"
                    onChange={e => updateInput(setAlloyKey, e.target.value)}
                  ></input>
                </div>
              )}
              <div>
                Used to create a CSS style definition that hides content areas
                of your web page while personalized content is loaded from the
                server. If this option is not provided, the SDK does not attempt
                to hide any content areas while personalized content is loaded,
                potentially resulting in “flicker”.
              </div>
            </div>
          </div>

          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>Audiences options</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>cookieDestinationsEnabled</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e =>
                      updateSubresources("cookieDestinationsEnabled")
                    }
                  ></input>
                </div>
              )}
              <div>
                Enables Audience Manager cookie destinations, which allows the
                setting of cookies based on segment qualification.
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>urlDestinationsEnabled</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e => updateSubresources("urlDestinationsEnabled")}
                  ></input>
                </div>
              )}
              <div>
                Enables Audience Manager URL destinations, which allows the
                firing of URLs based on segment qualification.
              </div>
            </div>
          </div>

          <div className={appStyles.table}>
            <div className={cx(appStyles.header, appStyles.row)}>
              <div>Identity options</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>idMigrationEnabled</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e => updateSubresources("idMigrationEnabled")}
                  ></input>
                </div>
              )}
              <div>
                If true, the SDK reads and sets old AMCV cookies. This option
                helps with transitioning to using Adobe Experience Platform Web
                SDK while some parts of the site might still use Visitor.js. If
                Visitor API is defined on the page, the SDK queries Visitor API
                for the ECID. This option enables you to dual-tag pages with the
                Adobe Experience Platform Web SDK and still have the same ECID.
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>thirdPartyCookiesEnabled</div>
              {activeTab === "tester" && (
                <div>
                  <input
                    className={appStyles.value}
                    type="checkbox"
                    onChange={e =>
                      updateSubresources("thirdPartyCookiesEnabled")
                    }
                  ></input>
                </div>
              )}
              <div>
                Enables the setting of Adobe third-party cookies. The SDK can
                persist the visitor ID in a third-party context to enable the
                same visitor ID to be used across sites. Use this option if you
                have multiple sites or you want to share data with partners;
                however, sometimes this option is not desired for privacy
                reasons.
              </div>
            </div>
          </div>

          {activeTab === "tester" && (
            <div className={appStyles.submit}>
              {alloyKeyError && (
                <div className={appStyles.err}>
                  Please enter a value for all required fields
                </div>
              )}
              <button
                onClick={makeAPICall}
                className={appStyles.button}
                type="submit"
              >
                {loading ? (
                  <div className={appStyles.spinner}>
                    <div className={appStyles.bounce1}></div>
                    <div className={appStyles.bounce2}></div>
                    <div className={appStyles.bounce3}></div>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          )}
        </form>

        {response && activeTab === "tester" && <CodeBlock code={response} />}

        {activeTab === "description" && (
          <>
            <div>
              <h3>How to use</h3>
              <CodeBlock>{`alloy("configure", {
  "edgeConfigId": "ebebf826-a01f-4458-8cec-ef61de241c93",
  "orgId":"ADB3LETTERSANDNUMBERS@AdobeOrg"
});`}</CodeBlock>
            </div>

            <div className={appStyles.tester}>
              <h3>Sample Response</h3>
              <CodeBlock>
                {JSON.stringify(
                  [
                    {
                      requestId: "18a1cf03-d013-4c1b-b8b0-f785e75f58c9",
                      handle: [
                        {
                          payload: [
                            {
                              collect: {
                                val: "n"
                              }
                            }
                          ],
                          type: "consent:preferences"
                        },
                        {
                          payload: [
                            {
                              key:
                                "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity",
                              value:
                                "CiY5MTQ0MDg5MjEwMzIzMzc3MTc4MDMxNTA2MzYzNzEzMTA0MTk0N1IOCPmsht7JLxgBKgNWQTagAfmsht7JL_AB-ayG3skv",
                              maxAge: 34128000
                            },
                            {
                              key:
                                "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent",
                              value: "general=out",
                              maxAge: 15552000
                            },
                            {
                              key:
                                "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent_check",
                              value: "1",
                              maxAge: 7200
                            }
                          ],
                          type: "state:store"
                        }
                      ],
                      warnings: [
                        {
                          title: "Request ignored",
                          status: 200,
                          detail:
                            "Unable to process this request due to lack of user consent.",
                          type: "https://ns.adobe.com/aep/errors/EXEG-0301-200"
                        }
                      ]
                    }
                  ],
                  null,
                  2
                )}
              </CodeBlock>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DataCollection;
