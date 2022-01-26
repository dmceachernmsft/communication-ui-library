// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { toFlatCommunicationIdentifier } from '@internal/acs-ui-common';
import { _isInCall, _isPreviewOn } from '@internal/calling-component-bindings';
import { LocalVideoStreamState, RemoteVideoStreamState } from '@internal/calling-stateful-client';
import { VideoGalleryRemoteParticipant, VideoGalleryStream } from '@internal/react-components';
import * as reselect from 'reselect';
import {
  getDeviceManager,
  getDisplayName,
  getDominantSpeakers,
  getLocalVideoStreams,
  getRemoteParticipants
} from './baseSelectors';
import { callStatusSelector } from './callStatusSelector';

/**
 * Picture in picture in picture needs to display the most-dominant remote speaker, as well as the local participant video.
 * @private
 */
export const localAndRemotePIPSelector = reselect.createSelector(
  [
    getDisplayName,
    callStatusSelector,
    getDeviceManager,
    getLocalVideoStreams,
    getRemoteParticipants,
    getDominantSpeakers
  ],
  (displayName, callStatus, deviceManager, localVideoStreams, remoteParticipants, dominantSpeakers) => {
    // Get local video stream details
    let localVideoStream: LocalVideoStreamState | undefined;
    if (_isInCall(callStatus.callStatus)) {
      localVideoStream = localVideoStreams?.find((i) => i.mediaStreamType === 'Video');
    } else if (_isPreviewOn(deviceManager)) {
      // TODO: we should take in a LocalVideoStream that developer wants to use as their 'Preview' view. We should also
      // handle cases where 'Preview' view is in progress and not necessary completed.
      localVideoStream = deviceManager.unparentedViews[0];
    }

    // Get remote video stream details of the most dominant participant
    const [dominantRemoteParticipantId] = dominantSpeakers ?? [];
    const dominantRemoteParticipant =
      remoteParticipants &&
      Object.values(remoteParticipants)?.find(
        (remoteParticipant) =>
          toFlatCommunicationIdentifier(remoteParticipant.identifier) === dominantRemoteParticipantId
      );

    return {
      localParticipant: {
        displayName,
        videoStream: {
          isAvailable: !!localVideoStream,
          isMirrored: localVideoStream?.view?.isMirrored,
          renderElement: localVideoStream?.view?.target
        }
      },
      dominantRemoteParticipant:
        dominantRemoteParticipant &&
        convertRemoteParticipantToVideoGalleryRemoteParticipant(
          toFlatCommunicationIdentifier(dominantRemoteParticipant.identifier),
          dominantRemoteParticipant.isMuted,
          dominantRemoteParticipant.isSpeaking && !dominantRemoteParticipant.isMuted,
          dominantRemoteParticipant.videoStreams,
          dominantRemoteParticipant.displayName
        )
    };
  }
);

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

const convertRemoteVideoStreamToVideoGalleryStream = (stream: RemoteVideoStreamState): VideoGalleryStream => {
  return {
    id: stream.id,
    isAvailable: stream.isAvailable,
    isMirrored: stream.view?.isMirrored,
    renderElement: stream.view?.target
  };
};
