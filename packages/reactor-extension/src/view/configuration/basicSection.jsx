/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useField } from "formik";
import { InlineAlert, Heading, Content, Link } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import RestoreDefaultValueButton from "../components/restoreDefaultValueButton";
import FormElementContainer from "../components/formElementContainer";
import { bridge } from "./basicSectionBridge";

export { bridge };

const BasicSection = ({ instanceFieldName, initInfo, isPreinstalled }) => {
  const [{ value: instanceValues }] = useField(instanceFieldName);
  const instanceDefaults = bridge.getInstanceDefaults({ initInfo });

  return (
    <FormElementContainer>
      <DataElementSelector>
        <FormikTextField
          data-test-id="nameField"
          label="Name"
          name={`${instanceFieldName}.name`}
          description={
            <span>
              Must match an instance name that is defined in the Web SDK{" "}
              <Link
                href="https://experienceleague.adobe.com/en/docs/experience-platform/collection/js/install/library"
                target="_blank"
                rel="noopener noreferrer"
              >
                base code
              </Link>{" "}
              from your site.
            </span>
          }
          isRequired
          width="size-5000"
        />
      </DataElementSelector>
      {instanceValues.persistedName &&
      instanceValues.name !== instanceValues.persistedName ? (
        <InlineAlert
          data-test-id="nameChangeAlert"
          variant="notice"
          styles={style({
            width: 400,
          })}
        >
          <Heading>Potential problems due to name change</Heading>
          <Content>
            Any rule components or data elements using this instance will no
            longer function as expected when running on your website. We
            recommend removing or updating those resources before publishing
            your next library.
          </Content>
        </InlineAlert>
      ) : null}
      {!isPreinstalled && (
        <>
          <div
            className={style({
              display: "flex",
            })}
          >
            <DataElementSelector>
              <FormikTextField
                data-test-id="orgIdField"
                label="IMS organization ID"
                name={`${instanceFieldName}.orgId`}
                description="Your assigned Experience Cloud organization ID."
                isRequired
                width="size-5000"
              />
            </DataElementSelector>
            <RestoreDefaultValueButton
              data-test-id="orgIdRestoreButton"
              name={`${instanceFieldName}.orgId`}
              defaultValue={instanceDefaults.orgId}
            />
          </div>
          <div
            className={style({
              display: "flex",
            })}
          >
            <DataElementSelector>
              <FormikTextField
                data-test-id="edgeDomainField"
                label="Edge domain"
                name={`${instanceFieldName}.edgeDomain`}
                description="The domain that will be used to interact with
                        Adobe services. Update this setting if you have
                        mapped one of your first-party domains (using
                        CNAME) to an Adobe-provisioned domain."
                isRequired
                width="size-5000"
              />
            </DataElementSelector>
            <RestoreDefaultValueButton
              data-test-id="edgeDomainRestoreButton"
              name={`${instanceFieldName}.edgeDomain`}
              defaultValue={instanceDefaults.edgeDomain}
            />
          </div>
        </>
      )}
    </FormElementContainer>
  );
};

BasicSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  initInfo: PropTypes.object.isRequired,
  isPreinstalled: PropTypes.bool.isRequired,
};

export default BasicSection;
