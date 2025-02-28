// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CallingHandlers } from '@internal/calling-component-bindings';
import { CommonProperties, toFlatCommunicationIdentifier } from '@internal/acs-ui-common';
import { ReactElement } from 'react';
import memoizeOne from 'memoize-one';
import { CallAdapter } from '..';
import { useAdapter } from '../adapter/CallAdapterProvider';
import { isCameraOn } from '../utils';
/* @conditional-compile-remove(PSTN-calls) */
import { DtmfTone } from '@azure/communication-calling';

/**
 * @private
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const useHandlers = <PropsT>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _component: (props: PropsT) => ReactElement | null
): Pick<CallingHandlers, CommonProperties<CallingHandlers, PropsT>> => {
  return createCompositeHandlers(useAdapter());
};

const createCompositeHandlers = memoizeOne(
  (adapter: CallAdapter): CallingHandlers => ({
    onCreateLocalStreamView: async (options) => {
      return await adapter.createStreamView(undefined, options);
    },
    onCreateRemoteStreamView: async (userId, options) => {
      return await adapter.createStreamView(userId, options);
    },
    onHangUp: async () => {
      await adapter.leaveCall();
    },
    /* @conditional-compile-remove(PSTN-calls) */
    onToggleHold: async () => {
      return adapter.getState().call?.state === 'LocalHold' ? await adapter.resumeCall() : await adapter.holdCall();
    },
    /* @conditional-compile-remove(PSTN-calls) */
    onAddParticipant: async (participant, options?) => {
      return await adapter.addParticipant(participant, options);
    },
    /* @conditional-compile-remove(PSTN-calls) */
    onSendDtmfTone: async (dtmfTone: DtmfTone) => {
      await adapter.sendDtmfTone(dtmfTone);
    },
    onRemoveParticipant: async (userId) => {
      await adapter.removeParticipant(userId);
    },
    onSelectCamera: async (deviceInfo, options) => {
      await adapter.setCamera(deviceInfo, options);
    },
    onSelectMicrophone: async (deviceInfo) => {
      await adapter.setMicrophone(deviceInfo);
    },
    onSelectSpeaker: async (deviceInfo) => {
      await adapter.setSpeaker(deviceInfo);
    },
    onStartCall: (participants, options?) => {
      const rawIds = participants.map((participant) => toFlatCommunicationIdentifier(participant));
      return adapter.startCall(rawIds, options);
    },
    onStartScreenShare: async () => {
      await adapter.startScreenShare();
    },
    onStopScreenShare: async () => {
      await adapter.stopScreenShare();
    },
    onToggleCamera: async (options) => {
      isCameraOn(adapter.getState()) ? await adapter.stopCamera() : await adapter.startCamera(options);
    },
    onToggleMicrophone: async () => {
      return adapter.getState().call?.isMuted ? await adapter.unmute() : await adapter.mute();
    },
    onToggleScreenShare: async () => {
      return adapter.getState().call?.isScreenSharingOn
        ? await adapter.stopScreenShare()
        : await adapter.startScreenShare();
    },
    onStartLocalVideo: async () => {
      if (adapter.getState().call) {
        return adapter.startCamera();
      }
    },
    onDisposeLocalStreamView: async () => {
      return adapter.disposeStreamView();
    },
    onDisposeRemoteStreamView: async (userId) => {
      return adapter.disposeStreamView(userId);
    }
  })
);
