/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Config } from "../../hooks/useConfig";
import { ReactComponent as Check } from "../../images/check.svg";
import FormApproveConfirm from "./FormApproveConfirm";
import FormApproveOrRejectLaunch from "./FormApproveOrRejectLaunch";
import FormLaunchDraftToPreview from "./FormLaunchDraftToPreview";
import FormLaunchDraftToReview from "./FormLaunchDraftToReview";
import FormRejectReason from "./FormRejectReason";

export enum DraftStatusOperationsState {
  DraftToPreview,
  DraftToReview,
  LaunchApprovalPending,
  LaunchApproveOrReject,
  LaunchRejection,
  LaunchRejected,
  LaunchRejectedByAnotherUser,
  ApprovalConfirmation,
}

// Replace with generated type, EXP-1055 & EXP-1062
type RejectFeedback = {
  rejectedByUser: string;
  rejectDate: string;
  rejectReason: string;
} | null;

export const DraftStatusOperations = ({
  isLoading,
  featureFlags = { exp1055ReviewFlow: false },
  isLaunchRequested = false,
  isLaunchApproved = false,
  launchRequestedByUsername = "",
  canReview = false,
  rejectFeedback,
  rsRequestTimedOut,
  rejectExperimentLaunch,
  approveExperimentLaunch,
  confirmExperimentLaunchApproval,
  onLaunchClicked,
  onLaunchToPreviewClicked,
}: {
  isLoading: boolean;
  featureFlags: Config["featureFlags"];
  isLaunchRequested: boolean;
  isLaunchApproved: boolean;
  launchRequestedByUsername: string;
  canReview: boolean;
  rejectFeedback: RejectFeedback;
  rsRequestTimedOut: boolean;
  rejectExperimentLaunch: (fields: { reason: string }) => void;
  approveExperimentLaunch: () => void;
  confirmExperimentLaunchApproval: () => void;
  onLaunchClicked: () => void;
  onLaunchToPreviewClicked: () => void;
}) => {
  let defaultDraftUIState = DraftStatusOperationsState.DraftToPreview;
  /* istanbul ignore next until EXP-1055 & EXP-1062 done */
  if (featureFlags.exp1055ReviewFlow) {
    if (isLaunchApproved) {
      defaultDraftUIState = canReview
        ? DraftStatusOperationsState.ApprovalConfirmation
        : DraftStatusOperationsState.LaunchApprovalPending;
    } else if (rejectFeedback) {
      defaultDraftUIState = DraftStatusOperationsState.LaunchRejected;
    } else if (isLaunchRequested) {
      defaultDraftUIState = canReview
        ? DraftStatusOperationsState.LaunchApproveOrReject
        : DraftStatusOperationsState.LaunchApprovalPending;
    }
  }

  const [draftUIState, setDraftUIState] = useState<DraftStatusOperationsState>(
    defaultDraftUIState,
  );

  /* istanbul ignore next until EXP-1055 & EXP-1062 done */
  const resetDraftUIState = useCallback(
    () => setDraftUIState(defaultDraftUIState),
    [defaultDraftUIState, setDraftUIState],
  );

  /* istanbul ignore next until EXP-1055 & EXP-1062 done */
  const handleLaunchApprovalClicked = useCallback(async () => {
    await approveExperimentLaunch();
    setDraftUIState(DraftStatusOperationsState.ApprovalConfirmation);
  }, [approveExperimentLaunch, setDraftUIState]);

  switch (draftUIState) {
    /* istanbul ignore next until EXP-1055 & EXP-1062 done */
    case DraftStatusOperationsState.LaunchApproveOrReject:
      return (
        <FormApproveOrRejectLaunch
          {...{
            isLoading,
            rsRequestTimedOut,
            launchRequestedByUsername,
            onApprove: handleLaunchApprovalClicked,
            onReject: () =>
              setDraftUIState(DraftStatusOperationsState.LaunchRejection),
          }}
        />
      );

    /* istanbul ignore next until EXP-1055 & EXP-1062 done */
    case DraftStatusOperationsState.ApprovalConfirmation:
      return (
        <FormApproveConfirm
          {...{
            isLoading,
            onConfirm: confirmExperimentLaunchApproval,
          }}
        />
      );

    /* istanbul ignore next until EXP-1055 & EXP-1062 done */
    case DraftStatusOperationsState.LaunchRejection:
      return (
        <FormRejectReason
          {...{
            isLoading,
            onSubmit: rejectExperimentLaunch,
            onCancel: resetDraftUIState,
          }}
        />
      );

    /* istanbul ignore next until EXP-1055 & EXP-1062 done */
    case DraftStatusOperationsState.LaunchRejected:
      return (
        <Alert variant="warning">
          <div className="text-body">
            <p>
              Your experiment was <strong>Rejected</strong> due to:
            </p>
            <p className="mb-0">
              {rejectFeedback!.rejectedByUser} on {rejectFeedback!.rejectDate}:
            </p>
            <p className="bg-white rounded border p-3">
              {rejectFeedback!.rejectReason}
            </p>
          </div>
        </Alert>
      );

    /* istanbul ignore next until EXP-1055 & EXP-1062 done */
    case DraftStatusOperationsState.LaunchApprovalPending:
      return (
        <Alert
          data-testid="submit-success"
          variant="success"
          className="bg-transparent text-success"
        >
          <p className="my-1" data-testid="in-review-label">
            <Check className="align-top" /> All set! This experiment will launch
            as soon as it is approved.
          </p>
        </Alert>
      );

    case DraftStatusOperationsState.DraftToReview:
      return (
        <FormLaunchDraftToReview
          {...{
            isLoading,
            onSubmit: onLaunchClicked,
            onCancel: resetDraftUIState,
            onLaunchToPreview: onLaunchToPreviewClicked,
          }}
        />
      );

    default:
      return (
        <FormLaunchDraftToPreview
          {...{
            isLoading,
            onSubmit: onLaunchToPreviewClicked,
            onLaunchWithoutPreview: () =>
              setDraftUIState(DraftStatusOperationsState.DraftToReview),
          }}
        />
      );
  }
};

export default DraftStatusOperations;
