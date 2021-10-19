// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ContextualMenu, Icon, IDragOptions, Modal, Stack, Text, mergeStyles } from '@fluentui/react';
import React, { useCallback, useMemo, useRef } from 'react';
import { smartDominantSpeakerParticipants } from '../../gallery';
import { useIdentifiers } from '../../identifiers/IdentifierProvider';
import { useLocale } from '../../localization';
import { useTheme } from '../../theming';
import {
  BaseCustomStylesProps,
  OnRenderAvatarCallback,
  VideoGalleryLocalParticipant,
  VideoGalleryRemoteParticipant,
  VideoStreamOptions
} from '../../types';
import { GridLayout } from '../GridLayout';
import { StreamMedia } from '../StreamMedia';
import {
  floatingLocalVideoModalStyle,
  floatingLocalVideoTileStyle,
  gridStyle,
  screenSharingContainer,
  screenSharingNotificationIconContainer,
  screenSharingNotificationIconStyle,
  screenSharingNotificationContainerCameraOnStyles,
  screenSharingNotificationContainerCameraOffStyles,
  screenSharingNotificationTextStyle,
  videoGalleryContainerStyle,
  videoGalleryOuterDivStyle,
  horizontalGalleryStyle,
  SMALL_HORIZONTAL_GALLERY_TILE_STYLE,
  LARGE_HORIZONTAL_GALLERY_TILE_STYLE,
  SMALL_HORIZONTAL_GALLERY_TILE_SIZE,
  LARGE_HORIZONTAL_GALLERY_TILE_SIZE,
  SMALL_FLOATING_MODAL_SIZE,
  LARGE_FLOATING_MODAL_SIZE,
  HORIZONTAL_GALLERY_PADDING,
  FLOATING_MODAL_POSITION_FROM_RIGHT
} from '../styles/VideoGallery.styles';
import { useContainerWidth, isNarrowWidth } from '../utils/responsive';
import { VideoTile, VideoTileStylesProps } from '../VideoTile';
import { HorizontalGallery } from './HorizontalGallery';
import { RemoteVideoTile } from './RemoteVideoTile';
import { getVideoTileOverrideColor } from '../utils/videoTileStylesUtils';
import { HORIZONTAL_GALLERY_BUTTON_WIDTH, HORIZONTAL_GALLERY_GAP } from '../styles/HorizontalGallery.styles';

const emptyStyles = {};
const floatingTileHostId = 'UILibraryFloatingTileHost';

const MAX_VIDEO_PARTICIPANTS_TILES = 4; // Currently the Calling JS SDK supports up to 4 remote video streams
const MAX_VIDEO_DOMINANT_SPEAKERS = 4;
const MAX_AUDIO_PARTICIPANTS_TILES = 100;
const MAX_AUDIO_DOMINANT_SPEAKERS = 6;

/**
 * Strings of {@link VideoGalleryStrings} that can be overridden.
 *
 * @public
 */
export interface VideoGalleryStrings {
  /** Message to let user know they are sharing their screen. */
  screenSharingMessage: string;
}

/**
 * Props for {@link VideoGallery}.
 *
 * @public
 */
export interface VideoGalleryProps {
  /**
   * Allows users to pass an object containing custom CSS styles for the gallery container.
   *
   * @Example
   * ```
   * <VideoGallery styles={{ root: { border: 'solid 1px red' } }} />
   * ```
   */
  styles?: BaseCustomStylesProps;
  /** Layout of the video tiles. */
  layout?: 'default' | 'floatingLocalVideo';
  /** Local video particpant */
  localParticipant: VideoGalleryLocalParticipant;
  /** List of remote video particpants */
  remoteParticipants?: VideoGalleryRemoteParticipant[];
  /** List of dominant speaker userIds in the order of their dominance. 0th index is the most dominant. */
  dominantSpeakers?: string[];
  /** Local video view options */
  localVideoViewOption?: VideoStreamOptions;
  /** Remote videos view options */
  remoteVideoViewOption?: VideoStreamOptions;
  /** Callback to create the local video stream view */
  onCreateLocalStreamView?: (options?: VideoStreamOptions) => Promise<void>;
  /** Callback to dispose of the local video stream view */
  onDisposeLocalStreamView?: () => void;
  /** Callback to render the local video tile*/
  onRenderLocalVideoTile?: (localParticipant: VideoGalleryLocalParticipant) => JSX.Element;
  /** Callback to create a remote video stream view */
  onCreateRemoteStreamView?: (userId: string, options?: VideoStreamOptions) => Promise<void>;
  /** Callback to render a remote video tile */
  onRenderRemoteVideoTile?: (remoteParticipant: VideoGalleryRemoteParticipant) => JSX.Element;
  onDisposeRemoteStreamView?: (userId: string) => Promise<void>;
  /** Callback to render a particpant avatar */
  onRenderAvatar?: OnRenderAvatarCallback;

  /**
   * Whether to display a mute icon beside the user's display name.
   * @defaultValue `true`
   */
  showMuteIndicator?: boolean;

  /**
   * Optional strings to override in component
   */
  strings?: Partial<VideoGalleryStrings>;
}

const DRAG_OPTIONS: IDragOptions = {
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
  keepInBounds: true
};

/**
 * VideoGallery represents a {@link GridLayout} of video tiles for a specific call.
 * It displays a {@link VideoTile} for the local user as well as for each remote participants who joined the call.
 *
 * @public
 */
export const VideoGallery = (props: VideoGalleryProps): JSX.Element => {
  const {
    localParticipant,
    remoteParticipants,
    localVideoViewOption,
    remoteVideoViewOption,
    dominantSpeakers,
    onRenderLocalVideoTile,
    onRenderRemoteVideoTile,
    onCreateLocalStreamView,
    onCreateRemoteStreamView,
    onDisposeRemoteStreamView,
    styles,
    layout,
    onRenderAvatar,
    showMuteIndicator
  } = props;

  const ids = useIdentifiers();
  const theme = useTheme();
  const localeStrings = useLocale().strings.videoGallery;

  const shouldFloatLocalVideo = useMemo((): boolean => {
    return !!(layout === 'floatingLocalVideo' && remoteParticipants && remoteParticipants.length > 0);
  }, [layout, remoteParticipants]);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const isNarrow = isNarrowWidth(containerWidth);
  const visibleVideoParticipants = useRef<VideoGalleryRemoteParticipant[]>([]);
  const visibleAudioParticipants = useRef<VideoGalleryRemoteParticipant[]>([]);

  visibleVideoParticipants.current = smartDominantSpeakerParticipants({
    participants: remoteParticipants?.filter((p) => p.videoStream?.isAvailable) ?? [],
    dominantSpeakers,
    visibleParticipants: visibleVideoParticipants.current.filter((p) => p.videoStream?.isAvailable),
    maxTiles: MAX_VIDEO_PARTICIPANTS_TILES,
    maxDominantSpeakers: MAX_VIDEO_DOMINANT_SPEAKERS
  });

  // Create a map of visibleVideoParticipants for faster searching.
  // This map will be used to identify overflow participants. i.e., participants
  // that should be rendered in horizontal gallery.
  const visibleVideoParticipantsMap = {};
  visibleVideoParticipants.current.forEach((p) => {
    visibleVideoParticipantsMap[p.userId] = true;
  });
  // Max Tiles calculated inside that gallery can be passed to this function
  // to only return the max number of tiles that can be rendered in the gallery.
  visibleAudioParticipants.current = smartDominantSpeakerParticipants({
    participants: remoteParticipants?.filter((p) => !visibleVideoParticipantsMap[p.userId]) ?? [],
    dominantSpeakers,
    visibleParticipants: visibleAudioParticipants.current.filter((p) => !visibleVideoParticipantsMap[p.userId]),
    maxTiles: MAX_AUDIO_PARTICIPANTS_TILES,
    maxDominantSpeakers: MAX_AUDIO_DOMINANT_SPEAKERS
  });

  // If there are no video participants, we assign all audio participants as grid participants and assign
  // an empty array as horizontal gallery partipants to avoid rendering the horizontal gallery.
  const gridParticipants =
    visibleVideoParticipants.current.length > 0 ? visibleVideoParticipants.current : visibleAudioParticipants.current;
  const horizontalGalleryParticipants =
    visibleVideoParticipants.current.length > 0 ? visibleAudioParticipants.current : [];

  const screenSharingNotification = useMemo((): JSX.Element | undefined => {
    if (!localParticipant.isScreenSharingOn) {
      return undefined;
    }

    const screenSharingNotificationContainerStyle = mergeStyles(
      localParticipant.videoStream?.renderElement
        ? screenSharingNotificationContainerCameraOnStyles
        : screenSharingNotificationContainerCameraOffStyles,
      getVideoTileOverrideColor(!!localParticipant.videoStream?.renderElement, theme, 'neutralSecondary')
    );

    const screenSharingNotificationIconThemedStyle = mergeStyles(
      screenSharingNotificationIconStyle,
      getVideoTileOverrideColor(!!localParticipant.videoStream?.renderElement, theme, 'neutralTertiary')
    );

    return (
      <Stack horizontalAlign={'center'} verticalAlign={'center'} className={screenSharingContainer}>
        <Stack
          horizontalAlign={'center'}
          verticalAlign={'center'}
          className={screenSharingNotificationContainerStyle}
          tokens={{ childrenGap: '1rem' }}
        >
          <Stack horizontal verticalAlign={'center'} className={screenSharingNotificationIconContainer}>
            <Icon iconName="ControlButtonScreenShareStart" className={screenSharingNotificationIconThemedStyle} />
          </Stack>
          <Text className={screenSharingNotificationTextStyle} aria-live={'polite'}>
            {props.strings?.screenSharingMessage ?? localeStrings.screenSharingMessage}
          </Text>
        </Stack>
      </Stack>
    );
  }, [
    localParticipant.isScreenSharingOn,
    localParticipant.videoStream,
    localParticipant.videoStream?.renderElement,
    theme
  ]);

  /**
   * Utility function for memoized rendering of LocalParticipant.
   */
  const localVideoTile = useMemo((): JSX.Element => {
    const localVideoStream = localParticipant?.videoStream;

    if (onRenderLocalVideoTile) return onRenderLocalVideoTile(localParticipant);

    let localVideoTileStyles: VideoTileStylesProps = {};
    if (shouldFloatLocalVideo) {
      localVideoTileStyles = floatingLocalVideoTileStyle;
    }

    if (localVideoStream && !localVideoStream.renderElement) {
      onCreateLocalStreamView && onCreateLocalStreamView(localVideoViewOption);
    }

    return (
      <VideoTile
        userId={localParticipant.userId}
        renderElement={
          localVideoStream?.renderElement ? (
            <StreamMedia videoStreamElement={localVideoStream.renderElement} />
          ) : undefined
        }
        displayName={localParticipant?.displayName}
        styles={localVideoTileStyles}
        onRenderPlaceholder={localParticipant.isScreenSharingOn ? () => <></> : onRenderAvatar}
        isMuted={localParticipant.isMuted}
        showMuteIndicator={showMuteIndicator}
      >
        {screenSharingNotification}
      </VideoTile>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    localParticipant,
    localParticipant.isScreenSharingOn,
    localParticipant.videoStream,
    localParticipant.videoStream?.renderElement,
    onCreateLocalStreamView,
    onRenderLocalVideoTile,
    onRenderAvatar,
    shouldFloatLocalVideo
  ]);

  const defaultOnRenderVideoTile = useCallback(
    (participant: VideoGalleryRemoteParticipant, isVideoParticipant: boolean) => {
      const remoteVideoStream = participant.videoStream;
      return (
        <RemoteVideoTile
          key={participant.userId}
          userId={participant.userId}
          onCreateRemoteStreamView={isVideoParticipant ? onCreateRemoteStreamView : undefined}
          onDisposeRemoteStreamView={isVideoParticipant ? onDisposeRemoteStreamView : undefined}
          isAvailable={isVideoParticipant ? remoteVideoStream?.isAvailable : false}
          renderElement={isVideoParticipant ? remoteVideoStream?.renderElement : undefined}
          remoteVideoViewOption={isVideoParticipant ? remoteVideoViewOption : undefined}
          isMuted={participant.isMuted}
          isSpeaking={participant.isSpeaking}
          displayName={participant.displayName}
          onRenderAvatar={onRenderAvatar}
          showMuteIndicator={showMuteIndicator}
        />
      );
    },
    [onCreateRemoteStreamView, onDisposeRemoteStreamView, remoteVideoViewOption, onRenderAvatar, showMuteIndicator]
  );

  const gridTiles = useMemo(() => {
    // If user provided a custom onRender function return that function.
    if (onRenderRemoteVideoTile) {
      return gridParticipants.map((participant) => onRenderRemoteVideoTile(participant));
    }

    // Else return Remote Stream Video Tiles
    return gridParticipants.map((participant): JSX.Element => {
      return defaultOnRenderVideoTile(participant, true);
    });
  }, [defaultOnRenderVideoTile, gridParticipants, onRenderRemoteVideoTile]);

  if (!shouldFloatLocalVideo && localParticipant) {
    gridTiles.push(
      <Stack data-ui-id={ids.videoGallery} horizontalAlign="center" verticalAlign="center" className={gridStyle} grow>
        {localParticipant && localVideoTile}
      </Stack>
    );
  }

  const horizontalGalleryTiles = useMemo(() => {
    // If user provided a custom onRender function return that function.
    if (onRenderRemoteVideoTile) {
      return horizontalGalleryParticipants.map((participant) => onRenderRemoteVideoTile(participant));
    }
    return horizontalGalleryParticipants.map((participant): JSX.Element => {
      return (
        <div
          key={participant.userId}
          style={isNarrow ? SMALL_HORIZONTAL_GALLERY_TILE_STYLE : LARGE_HORIZONTAL_GALLERY_TILE_STYLE}
        >
          {defaultOnRenderVideoTile(participant, shouldFloatLocalVideo)}
        </div>
      );
    });
  }, [
    horizontalGalleryParticipants,
    onRenderRemoteVideoTile,
    isNarrow,
    defaultOnRenderVideoTile,
    shouldFloatLocalVideo
  ]);

  const tilesPerHorizontalGalleryPage = getTilesPerHorizontalGalleryPage(containerWidth, isNarrow);

  return (
    <div ref={containerRef} className={videoGalleryOuterDivStyle}>
      <Stack id={floatingTileHostId} grow styles={videoGalleryContainerStyle}>
        {shouldFloatLocalVideo && (
          <Modal
            isOpen={true}
            isModeless={true}
            dragOptions={DRAG_OPTIONS}
            styles={floatingLocalVideoModalStyle(isNarrow)}
            layerProps={{ hostId: floatingTileHostId }}
          >
            {localParticipant && localVideoTile}
          </Modal>
        )}
        <GridLayout styles={styles ?? emptyStyles}>{gridTiles}</GridLayout>
        {horizontalGalleryParticipants && horizontalGalleryParticipants.length > 0 && (
          <HorizontalGallery
            styles={horizontalGalleryStyle(isNarrow)}
            itemsPerPage={tilesPerHorizontalGalleryPage}
            hidePreviousButton={isNarrow}
            hideNextButton={isNarrow}
          >
            {horizontalGalleryTiles}
          </HorizontalGallery>
        )}
      </Stack>
    </div>
  );
};

/**
 * Helper function to get tiles per page for HorizontalGallery based on width and whether narrow widths are used.
 */
const getTilesPerHorizontalGalleryPage = (containerWidth: number, isNarrow: boolean): number => {
  // To get the width available for the horizontal gallery, we start with container width and subtract modal width,
  // modal position from right, and left and right padding of Horizontal Gallery
  const modalWidth = isNarrow
    ? convertRemToPx(SMALL_FLOATING_MODAL_SIZE.width)
    : convertRemToPx(LARGE_FLOATING_MODAL_SIZE.width);
  const modalPositionFromRight = convertRemToPx(FLOATING_MODAL_POSITION_FROM_RIGHT);
  const horizontalGalleryPadding = convertRemToPx(HORIZONTAL_GALLERY_PADDING);
  const horizontalGalleryWidth = containerWidth - modalWidth - modalPositionFromRight - horizontalGalleryPadding * 2;

  const buttonWidth = isNarrow ? 0 : convertRemToPx(HORIZONTAL_GALLERY_BUTTON_WIDTH);
  const tileWidth = isNarrow
    ? convertRemToPx(SMALL_HORIZONTAL_GALLERY_TILE_SIZE.width)
    : convertRemToPx(LARGE_HORIZONTAL_GALLERY_TILE_SIZE.width);
  const horizontalGalleryGap = convertRemToPx(HORIZONTAL_GALLERY_GAP);

  return calculateHorizontalGalleryTilesPerPage({
    horizontalGalleryWidth,
    buttonWidth,
    tileWidth,
    horizontalGalleryGap
  });
};

const convertRemToPx = (rem: number): number => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

const calculateHorizontalGalleryTilesPerPage = (args: {
  horizontalGalleryWidth: number;
  buttonWidth: number;
  tileWidth: number;
  horizontalGalleryGap: number;
}): number => {
  const { horizontalGalleryWidth, buttonWidth, tileWidth, horizontalGalleryGap } = args;
  /** First, figure out tileSpace if there are buttons
   *    <----horizontalGalleryWidth------->
   *    __________________________________
   *   | ||             ||             || |
   *   |<||             ||             ||>|
   *   |_||_____________||_____________||_|
   *       <---------tileSpace-------->
   *              OR no buttons
   *    __________________________________
   *   |                ||                |
   *   |                ||                |
   *   |________________||________________|
   *   <-------------tileSpace----------->
   */
  let tileSpace = horizontalGalleryWidth;
  if (buttonWidth !== 0) {
    // need to subtract width of buttons
    tileSpace -= 2 * buttonWidth;
    // need to subtract 2 gaps for buttons
    tileSpace -= 2 * horizontalGalleryGap;
  }
  // Then figure out how many tiles can fit in tileSpace.
  // tileSpace = n * tileWidth + (n - 1) * gap. Isolate n and take the floor.
  return Math.floor((tileSpace + horizontalGalleryGap) / (tileWidth + horizontalGalleryGap));
};
