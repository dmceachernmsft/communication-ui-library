// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { toFlatCommunicationIdentifier } from '@internal/acs-ui-common';
import { RemoteParticipantState, RemoteVideoStreamState } from '@internal/calling-stateful-client';
import { createSelector } from 'reselect';
import {
  getDisplayName,
  getIdentifier,
  getIsMuted,
  getIsScreenSharingOn,
  getLocalVideoStreams,
  getRemoteParticipants,
  getScreenShareRemoteParticipant
} from './baseSelectors';
import { memoizeFnAll } from '@internal/acs-ui-common';
import { VideoGalleryRemoteParticipant, VideoGalleryStream } from '@internal/react-components';

const convertRemoteVideoStreamToVideoGalleryStream = (stream: RemoteVideoStreamState): VideoGalleryStream => {
  return {
    id: stream.id,
    isAvailable: stream.isAvailable,
    isMirrored: stream.view?.isMirrored,
    renderElement: stream.view?.target
  };
};

const convertRemoteParticipantToVideoGalleryRemoteParticipant = (
  userId: string,
  isMuted: boolean,
  isSpeaking: boolean,
  videoStreams: { [key: number]: RemoteVideoStreamState },
  displayName?: string
): VideoGalleryRemoteParticipant => {
  const rawVideoStreamsArray = Object.values(videoStreams);
  let videoStream: VideoGalleryStream | undefined = undefined;
  let screenShareStream: VideoGalleryStream | undefined = undefined;

  if (rawVideoStreamsArray[0]) {
    if (rawVideoStreamsArray[0].mediaStreamType === 'Video') {
      videoStream = convertRemoteVideoStreamToVideoGalleryStream(rawVideoStreamsArray[0]);
    } else {
      screenShareStream = convertRemoteVideoStreamToVideoGalleryStream(rawVideoStreamsArray[0]);
    }
  }

  if (rawVideoStreamsArray[1]) {
    if (rawVideoStreamsArray[1].mediaStreamType === 'ScreenSharing') {
      screenShareStream = convertRemoteVideoStreamToVideoGalleryStream(rawVideoStreamsArray[1]);
    } else {
      videoStream = convertRemoteVideoStreamToVideoGalleryStream(rawVideoStreamsArray[1]);
    }
  }

  return {
    userId,
    displayName,
    isMuted,
    isSpeaking,
    videoStream,
    screenShareStream,
    isScreenSharingOn: screenShareStream !== undefined && screenShareStream.isAvailable
  };
};

const memoizedAllConvertRemoteParticipant = memoizeFnAll(
  (
    userId: string,
    isMuted: boolean,
    isSpeaking: boolean,
    videoStreams: { [key: number]: RemoteVideoStreamState },
    displayName?: string
  ): VideoGalleryRemoteParticipant => {
    return convertRemoteParticipantToVideoGalleryRemoteParticipant(
      userId,
      isMuted,
      isSpeaking,
      videoStreams,
      displayName
    );
  }
);

const videoGalleryRemoteParticipantsMemo = (
  remoteParticipants:
    | {
        [keys: string]: RemoteParticipantState;
      }
    | undefined
): VideoGalleryRemoteParticipant[] => {
  if (!remoteParticipants) return [];
  return memoizedAllConvertRemoteParticipant((memoizedFn) => {
    return Object.values(remoteParticipants).map((participant: RemoteParticipantState) => {
      return memoizedFn(
        toFlatCommunicationIdentifier(participant.identifier),
        participant.isMuted,
        participant.isSpeaking,
        participant.videoStreams,
        participant.displayName
      );
    });
  });
};

export const videoGallerySelector = createSelector(
  [
    getScreenShareRemoteParticipant,
    getRemoteParticipants,
    getLocalVideoStreams,
    getIsMuted,
    getIsScreenSharingOn,
    getDisplayName,
    getIdentifier
  ],
  (
    screenShareRemoteParticipantId,
    remoteParticipants,
    localVideoStreams,
    isMuted,
    isScreenSharingOn,
    displayName: string | undefined,
    identifier: string
  ) => {
    const screenShareRemoteParticipant =
      screenShareRemoteParticipantId && remoteParticipants
        ? remoteParticipants[screenShareRemoteParticipantId]
        : undefined;
    const localVideoStream = localVideoStreams?.find((i) => i.mediaStreamType === 'Video');
    return {
      screenShareParticipant: screenShareRemoteParticipant
        ? convertRemoteParticipantToVideoGalleryRemoteParticipant(
            toFlatCommunicationIdentifier(screenShareRemoteParticipant.identifier),
            screenShareRemoteParticipant.isMuted,
            screenShareRemoteParticipant.isSpeaking,
            screenShareRemoteParticipant.videoStreams,
            screenShareRemoteParticipant.displayName
          )
        : undefined,
      localParticipant: {
        userId: identifier,
        displayName: displayName ?? '',
        isMuted: isMuted,
        isScreenSharingOn: isScreenSharingOn,
        videoStream: {
          isAvailable: !!localVideoStream,
          isMirrored: localVideoStream?.view?.isMirrored,
          renderElement: localVideoStream?.view?.target
        }
      },
      remoteParticipants: videoGalleryRemoteParticipantsMemo(remoteParticipants)
    };
  }
);
