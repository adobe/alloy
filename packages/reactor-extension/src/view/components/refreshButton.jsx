/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ActionButton, TooltipTrigger, Tooltip } from "@adobe/react-spectrum";
import Refresh from "@spectrum-icons/workflow/Refresh";
import PropTypes from "prop-types";

/**
 * A reusable refresh button component for reloading dropdown/input field data.
 *
 * @example
 * // Basic usage
 * <RefreshButton onPress={handleRefresh} />
 *
 * @example
 * // With loading state and custom labels
 * const [isLoading, setIsLoading] = useState(false);
 * const handleRefresh = async () => {
 *   setIsLoading(true);
 *   await reloadData();
 *   setIsLoading(false);
 * };
 *
 * <RefreshButton
 *   onPress={handleRefresh}
 *   isDisabled={isLoading}
 *   tooltipText="Refresh schema list"
 *   ariaLabel="Refresh schemas"
 * />
 */
const RefreshButton = ({
  onPress,
  isDisabled = false,
  tooltipText = "Refresh list",
  ariaLabel = "Refresh",
}) => {
  return (
    <TooltipTrigger>
      <ActionButton
        isQuiet
        onPress={onPress}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
      >
        <Refresh />
      </ActionButton>
      <Tooltip>{tooltipText}</Tooltip>
    </TooltipTrigger>
  );
};

RefreshButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  tooltipText: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default RefreshButton;
