/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  Tab,
  Collection,
  Button,
  TabList,
  Tabs,
  Text,
} from "@react-spectrum/s2";

/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { FieldArray, useField } from "formik";
import { useState } from "react";
import DeleteIcon from "@react-spectrum/s2/icons/Delete";
import { Item } from "@adobe/react-spectrum";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";
import useNewlyValidatedFormSubmission from "../../../utils/useNewlyValidatedFormSubmission";
import useFocusFirstError from "../../../utils/useFocusFirstError";
import Heading from "../../../components/typography/heading";
import getDefaultIdentity from "../utils/getDefaultIdentity";
import FormElementContainer from "../../../components/formElementContainer";
import getDefaultIdentifier from "../utils/getDefaultIdentifier";
import DataElementSelector from "../../../components/dataElementSelector";
import FormikTextField from "../../../components/formikReactSpectrum3/formikTextField";
import FormikPicker from "../../../components/formikReactSpectrum3/formikPicker";
import * as AUTHENTICATED_STATE from "../constants/authenticatedState";
import FormikCheckbox from "../../../components/formikReactSpectrum3/formikCheckbox";
import NamespacesComponent from "./NamespacesComponent";
import { findNamespace } from "../utils/namespacesUtils";

const Identity = ({ context }) => {
  const { current } = context;
  const { namespaces } = current;
  const [{ value: identities }] = useField("identities");

  const [selectedTabKey, setSelectedTabKey] = useState("0");

  useNewlyValidatedFormSubmission((errors) => {
    // If the user just tried to save the configuration and there's
    // a validation error, make sure the first accordion item containing
    // an error is shown.
    if (errors && errors.identities) {
      const identityIndexContainingErrors = errors.identities.findIndex(
        (identity) => identity,
      );
      setSelectedTabKey(String(identityIndexContainingErrors));
    }
  });

  useFocusFirstError();

  return (
    <FieldArray
      name="identities"
      render={(arrayHelpers) => {
        return (
          <>
            <div
              className={style({
                display: "flex",
                alignItems: "center",
              })}
            >
              <Heading size="M">Identities</Heading>
              <Button
                data-test-id="addIdentityButton"
                variant="secondary"
                onPress={() => {
                  arrayHelpers.push(getDefaultIdentity());
                  setSelectedTabKey(String(identities.length));
                }}
                styles={style({
                  marginStart: "[auto]",
                })}
              >
                Add identity
              </Button>
            </div>
            {/*
                There is an issue where the heavy line under the selected
                tab doesn't update in position or width when the label changes,
                which can occur when the user is changing an identity's namespace.
                This is a reported bug in React-Spectrum.
                https://github.com/adobe/react-spectrum/issues/2004
                */}
            <Tabs
              aria-label="Identities"
              selectedKey={selectedTabKey}
              onSelectionChange={setSelectedTabKey}
            >
              <TabList items={identities}>
                {identities.map((identity, index) => {
                  const label =
                    findNamespace(namespaces, identity.namespaceCode)?.name ||
                    identity.namespaceCode ||
                    "Unnamed identity";
                  return (
                    <Tab id={index} key={index}>
                      {label}
                    </Tab>
                  );
                })}
              </TabList>
              <Collection items={identities}>
                {identities.map((identity, index) => {
                  return (
                    <Item key={index}>
                      <FormElementContainer>
                        <FieldArray
                          id={`identities.${index}.identifiers`}
                          name={`identities.${index}.identifiers`}
                          render={(identityArrayHelpers) => {
                            return (
                              <>
                                <div
                                  className={style({
                                    display: "flex",
                                    marginTop: 8,
                                    alignItems: "flex-end",
                                    justifyContent: "space-between",
                                  })}
                                >
                                  <NamespacesComponent
                                    name={`identities.${index}.namespaceCode`}
                                    selectedNamespaceCode={
                                      identity.namespaceCode
                                    }
                                    namespaces={namespaces}
                                    index={index}
                                  />
                                  <Button
                                    data-test-id={`addIdentifier${index}Button`}
                                    variant="secondary"
                                    onPress={() => {
                                      identityArrayHelpers.push(
                                        getDefaultIdentifier(),
                                      );
                                    }}
                                  >
                                    Add identifier
                                  </Button>
                                </div>
                                <div
                                  className={style({
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 20,
                                  })}
                                >
                                  {identity.identifiers.map(
                                    (identifier, identifierIndex) => (
                                      <div
                                        key={`identity${index}identifier${identifierIndex}`}
                                        className={style({
                                          display: "block",
                                          textAlign: "start",
                                          minWidth: 160,
                                          padding: 16,
                                          marginTop: 4,
                                          borderWidth: 1,
                                          borderRadius: "sm",
                                          backgroundColor: "layer-1",
                                          borderStyle: "solid",
                                          borderColor: "transparent-black-75",
                                          font: "body-sm",
                                        })}
                                      >
                                        <FormElementContainer>
                                          <DataElementSelector>
                                            <FormikTextField
                                              data-test-id={`identity${index}idField${identifierIndex}`}
                                              label="ID"
                                              name={`identities.${index}.identifiers.${identifierIndex}.id`}
                                              description="If the ID value is not a populated string, this identifier will automatically be removed from the identity map."
                                              isRequired
                                              width="size-5000"
                                            />
                                          </DataElementSelector>
                                          <FormikPicker
                                            data-test-id={`identity${index}authenticatedStateField${identifierIndex}`}
                                            label="Authenticated state"
                                            name={`identities.${index}.identifiers.${identifierIndex}.authenticatedState`}
                                            width="size-5000"
                                          >
                                            <Item
                                              key={
                                                AUTHENTICATED_STATE.AMBIGUOUS
                                              }
                                            >
                                              Ambiguous
                                            </Item>
                                            <Item
                                              key={
                                                AUTHENTICATED_STATE.AUTHENTICATED
                                              }
                                            >
                                              Authenticated
                                            </Item>
                                            <Item
                                              key={
                                                AUTHENTICATED_STATE.LOGGED_OUT
                                              }
                                            >
                                              Logged Out
                                            </Item>
                                            {(item) => (
                                              <Item key={item.value}>
                                                {item.label}
                                              </Item>
                                            )}
                                          </FormikPicker>
                                          <FormikCheckbox
                                            width="size-5000"
                                            data-test-id={`identity${index}primaryField${identifierIndex}`}
                                            name={`identities.${index}.identifiers.${identifierIndex}.primary`}
                                            description="Adobe Experience Platform will use the identity as an identifier to help stitch together more information about that individual. If left unchecked, the identifier within this namespace will still be collected, but the ECID will be used as the primary identifier for stitching."
                                          >
                                            Primary
                                          </FormikCheckbox>
                                        </FormElementContainer>
                                        {identities[index].identifiers.length >
                                          1 && (
                                          <Button
                                            data-test-id={`deleteIdentifier${index}Button${identifierIndex}`}
                                            variant="secondary"
                                            onPress={() => {
                                              identityArrayHelpers.remove(
                                                identifierIndex,
                                              );
                                            }}
                                            styles={style({
                                              marginTop: 12,
                                            })}
                                          >
                                            <DeleteIcon />
                                            <Text>Delete identifier</Text>
                                          </Button>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </>
                            );
                          }}
                        />
                        {identities.length > 1 && (
                          <div
                            className={style({
                              marginTop: 8,
                            })}
                          >
                            <Button
                              data-test-id={`deleteIdentity${index}Button`}
                              variant="secondary"
                              onClick={() => {
                                arrayHelpers.remove(index);
                                setSelectedTabKey("0");
                              }}
                            >
                              <DeleteIcon />
                              Delete identity
                            </Button>
                          </div>
                        )}
                      </FormElementContainer>
                    </Item>
                  );
                })}
              </Collection>
            </Tabs>
          </>
        );
      }}
    />
  );
};

Identity.propTypes = {
  context: PropTypes.object,
};

export default Identity;
