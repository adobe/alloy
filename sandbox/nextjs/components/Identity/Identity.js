import React, { useEffect, useState } from "react";

import appStyles from "../Layout/Layout.module.scss";
import cx from "classnames";

import Tabs from "../Tabs/Tabs";
import { api } from "../../services/api";
import CodeBlock from "../CodeBlock/CodeBlock";

const AlloyConfiguration = () => {
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
      <h2 className={appStyles}>Adobe Experience Cloud IDs</h2>
      <p>
        Adobe Experience Platform Web SDK leverages Adobe Identity Service. This
        ensures that each device has a unique identifier that is persisted on
        the device so activity between pages can be tied together.
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
              <div>Syncing identities</div>
              {activeTab === "tester" && <div>Value</div>}
              <div>Description</div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>id</div>
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
                This is the ID that you want to sync for the given namespace.
              </div>
            </div>
            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>authenticationState</div>
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
              <div>The authentication state of the ID.</div>
            </div>

            <div className={appStyles.row}>
              <div className={cx(appStyles.arg)}>primary</div>
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
                Determines whether this identity should be used as a primary
                fragment in the unified profile. By default, the ECID is set as
                the primary identifier for the user.
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
              <CodeBlock>{`alloy("getIdentity")
  .then(function(result) {
    // The command succeeded.
    console.log("ECID:", result.identity.ECID);
    console.log("RegionId:", result.edge.regionId);
  })
  .catch(function(error) {
    // The command failed.
    // "error" will be an error object with additional information.
  });
`}</CodeBlock>
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

export default AlloyConfiguration;
