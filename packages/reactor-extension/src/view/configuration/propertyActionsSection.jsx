/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Content,
  Dialog,
  DialogContainer,
  Divider,
  Flex,
  Heading,
  InlineAlert,
  ProgressCircle,
  Text,
  View,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel,
  Accordion,
} from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import repairStaleDataElementReferences, {
  PHASE,
  SKIP_REASON,
} from "../utils/repairStaleDataElementReferences";
import SectionHeader from "../components/sectionHeader";

const STATUS = {
  IDLE: "idle",
  CONFIRMING: "confirming",
  RUNNING: "running",
  SUMMARY: "summary",
};

/**
 * Maps a {@link SKIP_REASON} to a user-facing label, interpolating the data
 * element name when available (so users can act on the specific entry).
 *
 * @param {import("../utils/repairStaleDataElementReferences").SkippedEntry} item
 * @returns {string}
 */
const skipReasonLabel = (item) => {
  switch (item.reason) {
    case SKIP_REASON.MISSING_NAME:
      return "could not determine the original data element's name";
    case SKIP_REASON.NO_NAME_MATCH:
      return `no data element named "${item.dataElementName}" exists on this property`;
    case SKIP_REASON.AMBIGUOUS_NAME:
      return `more than one data element on this property is named "${item.dataElementName}"`;
    default:
      return item.reason;
  }
};

const initialTally = () => ({
  scanned: 0,
  repaired: 0,
  skipped: 0,
  failed: 0,
  totalCount: null,
  phase: PHASE.INDEXING,
});

/**
 * Renders an error message in italics so it stands out from the surrounding
 * prose as a quoted system message.
 *
 * @param {{children: React.ReactNode}} props - `children` may be a string OR a
 *   React Fragment (from a wrapped `UserReportableError`'s message chain).
 * @returns {React.ReactElement}
 */
const ErrorMessageQuote = ({ children }) => (
  <em style={{ fontStyle: "italic" }}>{children}</em>
);

ErrorMessageQuote.propTypes = {
  children: PropTypes.node,
};

/**
 * Builds the single-line "Last run: …" status text shown in the section
 * panel after a run. Returns a string for normal outcomes, a React node for
 * the fatal-error outcome (because `result.fatalError` can be a React
 * Fragment from a wrapped `UserReportableError`).
 *
 * Consumers MUST render this via JSX (e.g. `<Text>{formatLastRunSummary(r)}</Text>`)
 * rather than embedding in a string template — template interpolation would
 * stringify a Fragment to `[object Object]`.
 *
 * @param {import("../utils/repairStaleDataElementReferences").RepairResult|null} result
 * @returns {string|React.ReactNode|null}
 */
const formatLastRunSummary = (result) => {
  if (!result) return null;
  if (result.fatalError) {
    return (
      <>
        Last run failed:{" "}
        <ErrorMessageQuote>{result.fatalError}</ErrorMessageQuote>
      </>
    );
  }
  const noun = result.scanned === 1 ? "action" : "actions";
  const prefix = result.cancelled ? "Last run cancelled" : "Last run";
  const parts = [
    `${result.scanned} ${noun} scanned`,
    `${result.repaired.length} repaired`,
    `${result.skipped.length} skipped`,
    `${result.failed.length} failed`,
  ];
  return `${prefix}: ${parts.join(", ")}.`;
};

/**
 * Picks the `InlineAlert` variant, heading, and body for the summary dialog
 * based on the run's outcome. Order matters: fatal error > cancelled >
 * any failures > any skips > clean success.
 *
 * @param {import("../utils/repairStaleDataElementReferences").RepairResult|null} result
 * @returns {{
 *   variant: "neutral"|"positive"|"notice"|"negative",
 *   heading: string,
 *   text: string|React.ReactNode
 * }} `text` may be a React node when surfacing a wrapped
 *   `UserReportableError`'s message. Always render via `{alert.text}` — never
 *   in a string template.
 */
const summaryAlertProps = (result) => {
  if (!result) return { variant: "neutral", heading: "", text: "" };
  if (result.fatalError) {
    return {
      variant: "negative",
      heading: "Repair could not complete",
      text: result.fatalError,
    };
  }
  const repairedCount = result.repaired.length;
  if (result.cancelled) {
    return {
      variant: "notice",
      heading: "Cancelled",
      text: `Operation cancelled. Repaired ${repairedCount} of ${result.scanned} actions before stopping.`,
    };
  }
  if (result.failed.length > 0) {
    return {
      variant: "negative",
      heading: "Finished with errors",
      text: `Repaired ${repairedCount} of ${result.scanned} actions. ${result.skipped.length} skipped, ${result.failed.length} failed.`,
    };
  }
  if (result.skipped.length > 0) {
    return {
      variant: "notice",
      heading: "Finished",
      text: `Repaired ${repairedCount} of ${result.scanned} actions. ${result.skipped.length} skipped.`,
    };
  }
  return {
    variant: "positive",
    heading: "Finished",
    text: `Scanned ${result.scanned} actions. ${repairedCount === 0 ? "No stale references found." : `Repaired ${repairedCount} stale references.`}`,
  };
};

const PropertyActionsSection = ({ initInfo }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [tally, setTally] = useState(initialTally);
  const [result, setResult] = useState(null);
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const openConfirmation = () => {
    setResult(null);
    setTally(initialTally());
    setStatus(STATUS.CONFIRMING);
    setDialogVisible(true);
  };

  const cancelConfirmation = () => {
    setStatus(STATUS.IDLE);
    setDialogVisible(false);
  };

  const startRun = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus(STATUS.RUNNING);
    setDialogVisible(true);
    setTally(initialTally());
    setResult(null);

    let runResult;
    try {
      const {
        company: { orgId },
        tokens: { imsAccess },
        propertySettings: { id: propertyId },
      } = initInfo;

      runResult = await repairStaleDataElementReferences({
        orgId,
        imsAccess,
        propertyId,
        signal: controller.signal,
        onProgress: (event) => {
          if (!mountedRef.current) return;
          setTally({
            scanned: event.scanned,
            repaired: event.repaired,
            skipped: event.skipped,
            failed: event.failed,
            totalCount: event.totalCount,
            phase: event.phase,
          });
        },
      });
    } catch (e) {
      // Belt-and-suspenders: the orchestrator catches its own errors and
      // surfaces them via result.fatalError. This handles any unexpected
      // throw so the section never gets stuck in the running state.
      runResult = {
        scanned: 0,
        repaired: [],
        skipped: [],
        failed: [],
        totalCount: null,
        cancelled: false,
        fatalError: e?.message || String(e),
      };
    }

    if (!mountedRef.current) return;
    abortControllerRef.current = null;
    setResult(runResult);
    setStatus(STATUS.SUMMARY);
  }, [initInfo]);

  const cancelRun = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const showDialog = () => {
    setDialogVisible(true);
  };

  const closeSummary = () => {
    setDialogVisible(false);
  };

  const handleDialogDismiss = () => {
    if (status === STATUS.RUNNING) return;
    if (status === STATUS.CONFIRMING) {
      cancelConfirmation();
      return;
    }
    if (status === STATUS.SUMMARY) {
      closeSummary();
    }
  };

  return (
    <View>
      <PanelContent
        status={status}
        dialogVisible={dialogVisible}
        tally={tally}
        result={result}
        onRepairClick={openConfirmation}
        onShowProgress={showDialog}
        onCancelRun={cancelRun}
        onShowDetails={showDialog}
        onRunAgain={openConfirmation}
      />
      <DialogContainer
        onDismiss={handleDialogDismiss}
        isDismissable={status !== STATUS.RUNNING}
      >
        {dialogVisible && (
          <OperationDialog
            status={status}
            tally={tally}
            result={result}
            onConfirm={startRun}
            onCancelConfirmation={cancelConfirmation}
            onHide={hideDialog}
            onCancelRun={cancelRun}
            onClose={closeSummary}
            onRunAgain={openConfirmation}
          />
        )}
      </DialogContainer>
    </View>
  );
};

PropertyActionsSection.propTypes = {
  initInfo: PropTypes.object.isRequired,
};

export default PropertyActionsSection;

// ---------------------------------------------------------------------------
// Section panel
// ---------------------------------------------------------------------------

const PanelContent = ({
  status,
  dialogVisible,
  tally,
  result,
  onRepairClick,
  onShowProgress,
  onCancelRun,
  onShowDetails,
  onRunAgain,
}) => {
  const isIdle = status === STATUS.IDLE || status === STATUS.CONFIRMING;
  const isRunning = status === STATUS.RUNNING;
  const isSummary = status === STATUS.SUMMARY;

  return (
    <Flex direction="column" gap="size-200">
      <SectionHeader marginTop={0} marginBottom={0}>
        Repair data element references
      </SectionHeader>
      <Text>
        Run a check to ensure identifiers in this property&apos;s rules
        correspond to data elements within the property and replace with data
        elements in this property that share a name when possible.
      </Text>

      {isIdle && (
        <Flex>
          <Button
            data-test-id="repairStaleDataElementsButton"
            variant="primary"
            onPress={onRepairClick}
          >
            Run repair
          </Button>
        </Flex>
      )}

      {isRunning && (
        <Flex direction="column" gap="size-100">
          <Text data-test-id="repairRunningHiddenTally">
            Repair in progress &mdash; Repaired {tally.repaired} &middot;
            Skipped {tally.skipped} &middot; Failed {tally.failed}
          </Text>
          {!dialogVisible && (
            <Flex direction="row" gap="size-100" justifyContent="end">
              <Button
                data-test-id="repairShowProgressButton"
                variant="primary"
                onPress={onShowProgress}
              >
                Show progress
              </Button>
              <Button
                data-test-id="repairCancelFromPanelButton"
                variant="secondary"
                onPress={onCancelRun}
              >
                Cancel
              </Button>
            </Flex>
          )}
        </Flex>
      )}

      {isSummary && (
        <Flex direction="column" gap="size-100">
          <Text data-test-id="repairLastRunSummary">
            {formatLastRunSummary(result)}
          </Text>
          {!dialogVisible && (
            <Flex direction="row" gap="size-100" justifyContent="end">
              <Button
                data-test-id="repairShowDetailsButton"
                variant="secondary"
                onPress={onShowDetails}
              >
                Show details
              </Button>
              <Button
                data-test-id="repairRunAgainButton"
                variant="primary"
                onPress={onRunAgain}
              >
                Run again
              </Button>
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};

PanelContent.propTypes = {
  status: PropTypes.string.isRequired,
  dialogVisible: PropTypes.bool.isRequired,
  tally: PropTypes.object.isRequired,
  result: PropTypes.object,
  onRepairClick: PropTypes.func.isRequired,
  onShowProgress: PropTypes.func.isRequired,
  onCancelRun: PropTypes.func.isRequired,
  onShowDetails: PropTypes.func.isRequired,
  onRunAgain: PropTypes.func.isRequired,
};

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

const OperationDialog = ({
  status,
  tally,
  result,
  onConfirm,
  onCancelConfirmation,
  onHide,
  onCancelRun,
  onClose,
  onRunAgain,
}) => {
  if (status === STATUS.CONFIRMING) {
    return (
      <Dialog data-test-id="repairConfirmationDialog">
        <Heading>Repair data element references</Heading>
        <Divider />
        <Content>
          <Flex direction="column" gap="size-200">
            <Text>
              This will scan every action in this property that belongs to the
              AEP Web SDK extension and update any that reference a data element
              no longer present on this property. Actions whose reference cannot
              be repaired automatically will be reported so you can fix them
              manually.
            </Text>
            <Flex
              direction="row"
              gap="size-100"
              justifyContent="end"
              marginTop="size-100"
            >
              <Button
                data-test-id="repairConfirmCancelButton"
                variant="secondary"
                onPress={onCancelConfirmation}
              >
                Cancel
              </Button>
              <Button
                data-test-id="repairConfirmStartButton"
                variant="cta"
                onPress={onConfirm}
                autoFocus
              >
                Confirm
              </Button>
            </Flex>
          </Flex>
        </Content>
      </Dialog>
    );
  }

  if (status === STATUS.RUNNING) {
    // `totalCount` is the property's total rule count (the scan paginates
    // rules and pulls each rule's components inline); `tally.scanned` counts
    // this extension's actions found across processed rules. The two are
    // intentionally distinct units.
    const totalKnown = typeof tally.totalCount === "number";
    const statusLine =
      tally.phase === PHASE.INDEXING
        ? "Loading data elements…"
        : totalKnown
          ? `Scanned ${tally.scanned} actions across ${tally.totalCount} rules`
          : `Scanned ${tally.scanned} actions`;

    return (
      <Dialog data-test-id="repairRunningDialog">
        <Heading>Repairing data element references</Heading>
        <Divider />
        <Content>
          <Flex direction="column" gap="size-200" alignItems="center">
            <Flex alignItems="center" gap="size-150">
              <ProgressCircle
                aria-label="Repair in progress"
                isIndeterminate
                size="S"
              />
              <Text data-test-id="repairRunningStatusLine">{statusLine}</Text>
            </Flex>
            <Text data-test-id="repairRunningTally">
              Repaired {tally.repaired} &middot; Skipped {tally.skipped}{" "}
              &middot; Failed {tally.failed}
            </Text>
            <Flex
              direction="row"
              gap="size-100"
              marginTop="size-100"
              alignSelf="end"
            >
              <Button
                data-test-id="repairHideButton"
                variant="secondary"
                onPress={onHide}
              >
                Hide
              </Button>
              <Button
                data-test-id="repairCancelFromDialogButton"
                variant="negative"
                onPress={onCancelRun}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        </Content>
      </Dialog>
    );
  }

  // STATUS.SUMMARY
  const alert = summaryAlertProps(result);
  return (
    <Dialog data-test-id="repairSummaryDialog">
      <Heading>Repair complete</Heading>
      <Divider />
      <Content>
        <Flex direction="column" gap="size-200">
          <InlineAlert
            variant={alert.variant}
            data-test-id="repairSummaryAlert"
          >
            <Heading>{alert.heading}</Heading>
            <Content>{alert.text}</Content>
          </InlineAlert>

          {result?.repaired?.length > 0 && (
            <Accordion data-test-id="repairSummaryRepairedAccordion">
              <Disclosure id="repaired">
                <DisclosureTitle>
                  Repaired ({result.repaired.length})
                </DisclosureTitle>
                <DisclosurePanel>
                  <Flex direction="column" gap="size-50">
                    {result.repaired.map((item) => (
                      <Text
                        key={item.ruleComponentId}
                        data-test-id="repairRepairedItem"
                      >
                        {item.ruleName ?? "(unknown rule)"} &rsaquo;{" "}
                        {item.actionName ?? "(unknown action)"} &mdash;{" "}
                        {item.dataElementName} ({item.oldDataElementId} &rarr;{" "}
                        {item.newDataElementId})
                      </Text>
                    ))}
                  </Flex>
                </DisclosurePanel>
              </Disclosure>
            </Accordion>
          )}

          {result?.skipped?.length > 0 && (
            <Accordion data-test-id="repairSummarySkippedAccordion">
              <Disclosure id="skipped">
                <DisclosureTitle>
                  Skipped ({result.skipped.length})
                </DisclosureTitle>
                <DisclosurePanel>
                  <Flex direction="column" gap="size-50">
                    {result.skipped.map((item) => (
                      <Text
                        key={item.ruleComponentId}
                        data-test-id="repairSkippedItem"
                      >
                        {item.ruleName ?? "(unknown rule)"} &rsaquo;{" "}
                        {item.actionName ?? "(unknown action)"} &mdash;{" "}
                        {skipReasonLabel(item)}
                        {item.candidates && item.candidates.length > 0 && (
                          <> (candidate IDs: {item.candidates.join(", ")})</>
                        )}
                      </Text>
                    ))}
                  </Flex>
                </DisclosurePanel>
              </Disclosure>
            </Accordion>
          )}

          {result?.failed?.length > 0 && (
            <Accordion data-test-id="repairSummaryFailedAccordion">
              <Disclosure id="failed">
                <DisclosureTitle>
                  Failed ({result.failed.length})
                </DisclosureTitle>
                <DisclosurePanel>
                  <Flex direction="column" gap="size-50">
                    {result.failed.map((item) => (
                      <Text
                        key={item.ruleComponentId}
                        data-test-id="repairFailedItem"
                      >
                        {item.ruleName ?? "(unknown rule)"} &rsaquo;{" "}
                        {item.actionName ?? "(unknown action)"} &mdash;{" "}
                        {item.error}
                      </Text>
                    ))}
                  </Flex>
                </DisclosurePanel>
              </Disclosure>
            </Accordion>
          )}

          <Flex
            direction="row"
            gap="size-100"
            justifyContent="end"
            marginTop="size-100"
          >
            <Button
              data-test-id="repairSummaryCloseButton"
              variant="secondary"
              onPress={onClose}
            >
              Close
            </Button>
            <Button
              data-test-id="repairSummaryRunAgainButton"
              variant="primary"
              onPress={onRunAgain}
            >
              Run again
            </Button>
          </Flex>
        </Flex>
      </Content>
    </Dialog>
  );
};

OperationDialog.propTypes = {
  status: PropTypes.string.isRequired,
  tally: PropTypes.object.isRequired,
  result: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancelConfirmation: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onCancelRun: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRunAgain: PropTypes.func.isRequired,
};
