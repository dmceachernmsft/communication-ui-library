// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CallState, DeviceManagerState } from '@internal/calling-stateful-client';
import type {
  AudioDeviceInfo,
  VideoDeviceInfo,
  Call,
  PermissionConstraints,
  RemoteParticipant,
  StartCallOptions,
  MediaDiagnosticChangedEventArgs,
  NetworkDiagnosticChangedEventArgs,
  PropertyChangedEvent,
  CallEndReason
} from '@azure/communication-calling';
/* @conditional-compile-remove(PSTN-calls) */
import { AddPhoneNumberOptions, DtmfTone } from '@azure/communication-calling';

import { CreateVideoStreamViewResult, VideoStreamOptions } from '@internal/react-components';
import type { CommunicationIdentifierKind } from '@azure/communication-common';
/* @conditional-compile-remove(PSTN-calls) */
import type { CommunicationUserIdentifier, PhoneNumberIdentifier } from '@azure/communication-common';
import type { AdapterState, Disposable, AdapterError, AdapterErrors } from '../../common/adapters';

/**
 * Major UI screens shown in the {@link CallComposite}.
 *
 * @public
 */
export type CallCompositePage =
  | 'accessDeniedTeamsMeeting'
  | 'call'
  | 'configuration'
  | /* @conditional-compile-remove(PSTN-calls) */ 'hold'
  | 'joinCallFailedDueToNoNetwork'
  | 'leftCall'
  | 'lobby'
  | /* @conditional-compile-remove(rooms) */ 'deniedPermissionToRoom'
  | 'removedFromCall'
  | /* @conditional-compile-remove(rooms) */ 'roomNotFound';

/**
 * Subset of CallCompositePages that represent an end call state.
 * @private
 */
export const END_CALL_PAGES: CallCompositePage[] = [
  'accessDeniedTeamsMeeting',
  'joinCallFailedDueToNoNetwork',
  'leftCall',
  /* @conditional-compile-remove(rooms) */ 'deniedPermissionToRoom',
  'removedFromCall',
  /* @conditional-compile-remove(rooms) */ 'roomNotFound'
];

/**
 * {@link CallAdapter} state for pure UI purposes.
 *
 * @public
 */
export type CallAdapterUiState = {
  isLocalPreviewMicrophoneEnabled: boolean;
  page: CallCompositePage;
};

/**
 * {@link CallAdapter} state inferred from Azure Communication Services backend.
 *
 * @public
 */
export type CallAdapterClientState = {
  userId: CommunicationIdentifierKind;
  displayName?: string;
  call?: CallState;
  devices: DeviceManagerState;
  endedCall?: CallState;
  isTeamsCall: boolean;
  /**
   * Latest error encountered for each operation performed via the adapter.
   */
  latestErrors: AdapterErrors;
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * Azure communications Phone number to make PSTN calls with.
   */
  alternateCallerId?: string;
};

/**
 * {@link CallAdapter} state.
 *
 * @public
 */
export type CallAdapterState = CallAdapterUiState & CallAdapterClientState;

/**
 * Callback for {@link CallAdapterSubscribers} 'participantsJoined' event.
 *
 * @public
 */
export type ParticipantsJoinedListener = (event: { joined: RemoteParticipant[] }) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'participantsLeft' event.
 *
 * @public
 */
export type ParticipantsLeftListener = (event: { removed: RemoteParticipant[] }) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'isMuted' event.
 *
 * @public
 */
export type IsMutedChangedListener = (event: { identifier: CommunicationIdentifierKind; isMuted: boolean }) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'callIdChanged' event.
 *
 * @public
 */
export type CallIdChangedListener = (event: { callId: string }) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'isLocalScreenSharingActiveChanged' event.
 *
 * @public
 */
export type IsLocalScreenSharingActiveChangedListener = (event: { isScreenSharingOn: boolean }) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'isSpeakingChanged' event.
 *
 * @public
 */
export type IsSpeakingChangedListener = (event: {
  identifier: CommunicationIdentifierKind;
  isSpeaking: boolean;
}) => void;

/**
 * Callback for {@link CallAdapterSubscribers} 'displayNameChanged' event.
 *
 * @public
 */
export type DisplayNameChangedListener = (event: {
  participantId: CommunicationIdentifierKind;
  displayName: string;
}) => void;

/**
 * Payload for {@link CallEndedListener} containing details on the ended call.
 *
 * @public
 */
export type CallAdapterCallEndedEvent = { callId?: string; callEndReason?: CallEndReason };

/**
 * Callback for {@link CallAdapterSubscribers} 'callEnded' event.
 *
 * @public
 */
export type CallEndedListener = (event: CallAdapterCallEndedEvent) => void;

/**
 * Payload for {@link DiagnosticChangedEventListner} where there is a change in a media diagnostic.
 *
 * @public
 */
export type MediaDiagnosticChangedEvent = MediaDiagnosticChangedEventArgs & {
  type: 'media';
};

/**
 * Payload for {@link DiagnosticChangedEventListner} where there is a change in a network diagnostic.
 *
 * @public
 */
export type NetworkDiagnosticChangedEvent = NetworkDiagnosticChangedEventArgs & {
  type: 'network';
};

/**
 * Callback for {@link CallAdapterSubscribers} 'diagnosticChanged' event.
 *
 * @public
 */
export type DiagnosticChangedEventListner = (
  event: MediaDiagnosticChangedEvent | NetworkDiagnosticChangedEvent
) => void;

/**
 * Functionality for managing the current call.
 *
 * @public
 */
export interface CallAdapterCallManagement {
  /**
   * Join the call with microphone initially on/off.
   *
   * @param microphoneOn - Whether microphone is initially enabled
   *
   * @public
   */
  joinCall(microphoneOn?: boolean): Call | undefined;
  /**
   * Leave the call
   *
   * @param forEveryone - Whether to remove all participants when leaving
   *
   * @public
   */
  leaveCall(forEveryone?: boolean): Promise<void>;
  /**
   * Start the camera
   * This method will start rendering a local camera view when the call is not active
   *
   * @param options - Options to control how video streams are rendered {@link @azure/communication-calling#VideoStreamOptions }
   *
   * @public
   */
  startCamera(options?: VideoStreamOptions): Promise<void>;
  /**
   * Stop the camera
   * This method will stop rendering a local camera view when the call is not active
   *
   * @public
   */
  stopCamera(): Promise<void>;
  /**
   * Mute the current user during the call or disable microphone locally
   *
   * @public
   */
  mute(): Promise<void>;
  /**
   * Unmute the current user during the call or enable microphone locally
   *
   * @public
   */
  unmute(): Promise<void>;
  /**
   * Start the call.
   *
   * @param participants - An array of participant ids to join
   *
   * @public
   */
  startCall(participants: string[], options?: StartCallOptions): Call | undefined;
  /**
   * Start sharing the screen during a call.
   *
   * @public
   */
  startScreenShare(): Promise<void>;
  /**
   * Stop sharing the screen
   *
   * @public
   */
  stopScreenShare(): Promise<void>;
  /**
   * Remove a participant from the call.
   *
   * @param userId - Id of the participant to be removed
   *
   * @public
   */
  removeParticipant(userId: string): Promise<void>;
  /**
   * Create the html view for a stream.
   *
   * @remarks
   * This method is implemented for composite
   *
   * @param remoteUserId - Id of the participant to render, leave it undefined to create the local camera view
   * @param options - Options to control how video streams are rendered {@link @azure/communication-calling#VideoStreamOptions }
   *
   * @public
   */
  createStreamView(remoteUserId?: string, options?: VideoStreamOptions): Promise<void | CreateVideoStreamViewResult>;
  /**
   * Dispose the html view for a stream.
   *
   * @remarks
   * This method is implemented for composite
   *
   * @param remoteUserId - Id of the participant to render, leave it undefined to dispose the local camera view
   * @param options - Options to control how video streams are rendered {@link @azure/communication-calling#VideoStreamOptions }
   *
   * @public
   */
  disposeStreamView(remoteUserId?: string, options?: VideoStreamOptions): Promise<void>;
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * Holds the call.
   *
   * @beta
   */
  holdCall(): Promise<void>;
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * Resumes the call from a `LocalHold` state.
   *
   * @beta
   */
  resumeCall(): Promise<void>;
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * Add a participant to the call.
   *
   * @beta
   */
  addParticipant(participant: PhoneNumberIdentifier, options?: AddPhoneNumberOptions): Promise<void>;
  /* @conditional-compile-remove(PSTN-calls) */
  addParticipant(participant: CommunicationUserIdentifier): Promise<void>;
  /* @conditional-compile-remove(PSTN-calls) */
  /**
   * send dtmf tone to another participant in a 1:1 PSTN call
   *
   * @beta
   */
  sendDtmfTone(dtmfTone: DtmfTone): Promise<void>;
}

/**
 * Functionality for managing devices within a call.
 *
 * @public
 */
export interface CallAdapterDeviceManagement {
  /**
   * Ask for permissions of devices.
   *
   * @remarks
   * Browser permission window will pop up if permissions are not granted yet
   *
   * @param constrain - Define constraints for accessing local devices {@link @azure/communication-calling#PermissionConstraints }
   *
   * @public
   */
  askDevicePermission(constrain: PermissionConstraints): Promise<void>;
  /**
   * Query for available camera devices.
   *
   * @remarks
   * This method should be called after askDevicePermission()
   *
   * @return An array of video device information entities {@link @azure/communication-calling#VideoDeviceInfo }
   *
   * @public
   */
  queryCameras(): Promise<VideoDeviceInfo[]>;
  /**
   * Query for available microphone devices.
   *
   * @remarks
   * This method should be called after askDevicePermission()
   *
   * @return An array of audio device information entities {@link @azure/communication-calling#AudioDeviceInfo }
   *
   * @public
   */
  queryMicrophones(): Promise<AudioDeviceInfo[]>;
  /**
   * Query for available microphone devices.
   *
   * @remarks
   * This method should be called after askDevicePermission()
   *
   * @return An array of audio device information entities {@link @azure/communication-calling#AudioDeviceInfo }
   *
   * @public
   */
  querySpeakers(): Promise<AudioDeviceInfo[]>;
  /**
   * Set the camera to use in the call.
   *
   * @param sourceInfo - Camera device to choose, pick one returned by  {@link CallAdapterDeviceManagement#queryCameras }
   * @param options - Options to control how the camera stream is rendered {@link @azure/communication-calling#VideoStreamOptions }
   *
   * @public
   */
  setCamera(sourceInfo: VideoDeviceInfo, options?: VideoStreamOptions): Promise<void>;
  /**
   * Set the microphone to use in the call.
   *
   * @param sourceInfo - Microphone device to choose, pick one returned by {@link CallAdapterDeviceManagement#queryMicrophones }
   *
   * @public
   */
  setMicrophone(sourceInfo: AudioDeviceInfo): Promise<void>;
  /**
   * Set the speaker to use in the call.
   *
   * @param sourceInfo - Speaker device to choose, pick one returned by {@link CallAdapterDeviceManagement#querySpeakers }
   *
   * @public
   */
  setSpeaker(sourceInfo: AudioDeviceInfo): Promise<void>;
}

/**
 * Call composite events that can be subscribed to.
 *
 * @public
 */
export interface CallAdapterSubscribers {
  /**
   * Subscribe function for 'participantsJoined' event.
   */
  on(event: 'participantsJoined', listener: ParticipantsJoinedListener): void;
  /**
   * Subscribe function for 'participantsLeft' event.
   */
  on(event: 'participantsLeft', listener: ParticipantsLeftListener): void;
  /**
   * Subscribe function for 'isMutedChanged' event.
   *
   * @remarks
   * The event will be triggered whenever current user or remote user mute state changed
   *
   */
  on(event: 'isMutedChanged', listener: IsMutedChangedListener): void;
  /**
   * Subscribe function for 'callIdChanged' event.
   *
   * @remarks
   * The event will be triggered when callId of current user changed.
   *
   */
  on(event: 'callIdChanged', listener: CallIdChangedListener): void;
  /**
   * Subscribe function for 'isLocalScreenSharingActiveChanged' event.
   */
  on(event: 'isLocalScreenSharingActiveChanged', listener: IsLocalScreenSharingActiveChangedListener): void;
  /**
   * Subscribe function for 'displayNameChanged' event.
   */
  on(event: 'displayNameChanged', listener: DisplayNameChangedListener): void;
  /**
   * Subscribe function for 'isSpeakingChanged' event.
   */
  on(event: 'isSpeakingChanged', listener: IsSpeakingChangedListener): void;
  /**
   * Subscribe function for 'callEnded' event.
   */
  on(event: 'callEnded', listener: CallEndedListener): void;
  /**
   * Subscribe function for 'diagnosticChanged' event.
   *
   * This event fires whenever there is a change in user facing diagnostics about the ongoing call.
   */
  on(event: 'diagnosticChanged', listener: DiagnosticChangedEventListner): void;
  /**
   * Subscribe function for 'selectedMicrophoneChanged' event.
   *
   * This event fires whenever the user selects a new microphone device.
   */
  on(event: 'selectedMicrophoneChanged', listener: PropertyChangedEvent): void;
  /**
   * Subscribe function for 'selectedSpeakerChanged' event.
   *
   * This event fires whenever the user selects a new speaker device.
   */
  on(event: 'selectedSpeakerChanged', listener: PropertyChangedEvent): void;
  /**
   * Subscribe function for 'error' event.
   */
  on(event: 'error', listener: (e: AdapterError) => void): void;

  /**
   * Unsubscribe function for 'participantsJoined' event.
   */
  off(event: 'participantsJoined', listener: ParticipantsJoinedListener): void;
  /**
   * Unsubscribe function for 'participantsLeft' event.
   */
  off(event: 'participantsLeft', listener: ParticipantsLeftListener): void;
  /**
   * Unsubscribe function for 'isMutedChanged' event.
   */
  off(event: 'isMutedChanged', listener: IsMutedChangedListener): void;
  /**
   * Unsubscribe function for 'callIdChanged' event.
   */
  off(event: 'callIdChanged', listener: CallIdChangedListener): void;
  /**
   * Unsubscribe function for 'isLocalScreenSharingActiveChanged' event.
   */
  off(event: 'isLocalScreenSharingActiveChanged', listener: IsLocalScreenSharingActiveChangedListener): void;
  /**
   * Unsubscribe function for 'displayNameChanged' event.
   */
  off(event: 'displayNameChanged', listener: DisplayNameChangedListener): void;
  /**
   * Unsubscribe function for 'isSpeakingChanged' event.
   */
  off(event: 'isSpeakingChanged', listener: IsSpeakingChangedListener): void;
  /**
   * Unsubscribe function for 'callEnded' event.
   */
  off(event: 'callEnded', listener: CallEndedListener): void;
  /**
   * Unsubscribe function for 'diagnosticChanged' event.
   */
  off(event: 'diagnosticChanged', listener: DiagnosticChangedEventListner): void;
  /**
   * Unsubscribe function for 'selectedMicrophoneChanged' event.
   */
  off(event: 'selectedMicrophoneChanged', listener: PropertyChangedEvent): void;
  /**
   * Unsubscribe function for 'selectedSpeakerChanged' event.
   */
  off(event: 'selectedSpeakerChanged', listener: PropertyChangedEvent): void;
  /**
   * Unsubscribe function for 'error' event.
   */
  off(event: 'error', listener: (e: AdapterError) => void): void;
}

/**
 * {@link CallComposite} Adapter interface.
 *
 * @public
 */
export interface CallAdapter
  extends AdapterState<CallAdapterState>,
    Disposable,
    CallAdapterCallManagement,
    CallAdapterDeviceManagement,
    CallAdapterSubscribers {}
