// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export { createStatefulCallClient } from './StatefulCallClient';
export type { StatefulCallClient, StatefulCallClientArgs, StatefulCallClientOptions } from './StatefulCallClient';
export type { StatefulDeviceManager } from './DeviceManagerDeclarative';
export type {
  CallAgentState,
  CallClientState,
  CallError,
  CallErrors,
  CallErrorTarget,
  CallState,
  DeviceManagerState,
  DiagnosticsCallFeatureState,
  IncomingCallState,
  LocalVideoStreamState,
  MediaDiagnosticsState,
  NetworkDiagnosticsState,
  RecordingCallFeatureState as RecordingCallFeature,
  RemoteParticipantState,
  RemoteVideoStreamState,
  TranscriptionCallFeatureState as TranscriptionCallFeature,
  VideoStreamRendererViewState
} from './CallClientState';
export type { CreateViewResult } from './StreamUtils';
export type { DeclarativeCallAgent } from './CallAgentDeclarative';
/* @conditional-compile-remove(one-to-n-calling) */
export type { DeclarativeIncomingCall } from './IncomingCallDeclarative';
