// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useMemo } from 'react';
import {
  StreamMedia,
  VideoGalleryStream,
  VideoStreamOptions,
  _PictureInPictureInPicture,
  _PictureInPictureInPictureTileProps
} from '@internal/react-components';

/**
 * @private
 */
export interface LocalAndRemotePIPProps {
  onClick: () => void;
  localParticipant: { displayName?: string; videoStream?: VideoGalleryStream };
  dominantRemoteParticipant?: {
    userId: string;
    displayName?: string;
    videoStream?: VideoGalleryStream;
  };

  /** Callback to create the local video stream view */
  onCreateLocalStreamView?: (options?: VideoStreamOptions) => Promise<void>;
  /** Callback to dispose of the local video stream view */
  onDisposeLocalStreamView?: () => void;
  /** Callback to create a remote video stream view */
  onCreateRemoteStreamView?: (userId: string, options?: VideoStreamOptions) => Promise<void>;
  /** Callback to dispose a remote video stream view */
  onDisposeRemoteStreamView?: (userId: string) => Promise<void>;
}

/**
 * @private
 */
export const LocalAndRemotePIP = (props: LocalAndRemotePIPProps): JSX.Element => {
  const localVideoTile = useMemo(
    () =>
      createLocalVideoTile(
        props.localParticipant.displayName,
        props.localParticipant?.videoStream,
        props.onCreateLocalStreamView
      ),
    [props.localParticipant.displayName, props.localParticipant?.videoStream, props.onCreateLocalStreamView]
  );

  const remoteVideoTile = useMemo(
    () =>
      props.dominantRemoteParticipant &&
      createRemoteVideoTile(
        props.dominantRemoteParticipant.userId,
        props.dominantRemoteParticipant.displayName,
        props.dominantRemoteParticipant.videoStream,
        props.onCreateRemoteStreamView
      ),
    [props.dominantRemoteParticipant, props.onCreateRemoteStreamView]
  );

  return (
    <_PictureInPictureInPicture
      onClick={props.onClick}
      // If there are no remote participants, show the local participant as the primary tile
      primaryTile={remoteVideoTile ?? localVideoTile}
      // If we are showing the local participant as the primary tile, show nothing for the secondary tile
      secondaryTile={remoteVideoTile ? localVideoTile : undefined}
    />
  );
};

const localVideoViewOptions = {
  scalingMode: 'Crop',
  isMirrored: true
} as VideoStreamOptions;

const createLocalVideoTile = (
  displayName?: string,
  videoStream?: VideoGalleryStream,
  onCreateLocalStreamView?: (options?: VideoStreamOptions) => Promise<void>
): _PictureInPictureInPictureTileProps => {
  if (videoStream && !videoStream.renderElement) {
    onCreateLocalStreamView && onCreateLocalStreamView(localVideoViewOptions);
  }

  return {
    orientation: 'portrait', // TODO: when the calling SDK provides height/width stream information - update this to reflect the stream orientation.
    renderElement: videoStream?.renderElement ? (
      <StreamMedia videoStreamElement={videoStream.renderElement} />
    ) : undefined,
    displayName: displayName
  };
};

const remoteVideoViewOptions = {
  scalingMode: 'Crop',
  isMirrored: false
} as VideoStreamOptions;

const createRemoteVideoTile = (
  participantId: string,
  displayName?: string,
  videoStream?: VideoGalleryStream,
  onCreateRemoteStreamView?: (userId: string, options?: VideoStreamOptions) => Promise<void>
): _PictureInPictureInPictureTileProps => {
  if (videoStream && !videoStream.renderElement) {
    onCreateRemoteStreamView && onCreateRemoteStreamView(participantId, remoteVideoViewOptions);
  }

  return {
    orientation: 'portrait', // TODO: when the calling SDK provides height/width stream information - update this to reflect the stream orientation.
    renderElement: videoStream?.renderElement ? (
      <StreamMedia videoStreamElement={videoStream.renderElement} />
    ) : undefined,
    displayName: displayName
  };
};
