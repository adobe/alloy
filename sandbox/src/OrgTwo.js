/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react";
import { Heading, View, Text } from "@adobe/react-spectrum";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function OrgTwo() {
  useSendPageViewEvent({ instanceName: "organizationTwo" });
  return (
    <View>
      <Heading level={1}>Multiple Organizations</Heading>
      <Text>
        This view is managed by a partnering company that owns a different Org
        ID.
      </Text>
      <Text>
        For that reason, we have created a second instance of Alloy, and
        configured it using the Org and Property IDs of Organization Two.
      </Text>
      <Text>
        Alloy instance is called: <i>organizationTwo</i>
      </Text>
      <View>
        <Text>
          {`
                organizationTwo("configure", {
                  datastreamId: 8888888,
                    log: true
                });
            `}
        </Text>
      </View>
      <Text>
        By going to the Network tab in your Developer Tools, you should see
        requests ending with <i>?configId=8888888</i>
      </Text>
    </View>
  );
}
