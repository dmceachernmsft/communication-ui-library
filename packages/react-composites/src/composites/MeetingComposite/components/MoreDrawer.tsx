// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import {
  OptionsDevice,
  _DrawerMenu as DrawerMenu,
  _DrawerMenuItemProps as DrawerMenuItemProps
} from '@internal/react-components';

/** @private */
export interface MoreDrawerStrings {
  peopleButtonLabel: string;
  speakerMenuTitle: string;
}

/** @private */
export interface MoreDrawerDevicesMenuProps {
  /**
   * Available speakers for selection
   */
  speakers?: OptionsDevice[];
  /**
   * Speaker that is shown as currently selected
   */
  selectedSpeaker?: OptionsDevice;
  /**
   * Speaker when a speaker is selected
   */
  onSelectSpeaker?: (device: OptionsDevice) => Promise<void>;
}

/** @private */
export interface MoreDrawerProps extends MoreDrawerDevicesMenuProps {
  onLightDismiss: () => void;
  onPeopleButtonClicked: () => void;
  strings: MoreDrawerStrings;
}

/** @private */
export const MoreDrawer = (props: MoreDrawerProps): JSX.Element => {
  const drawerMenuItems: DrawerMenuItemProps[] = [];

  if (props.speakers && props.speakers.length > 0) {
    drawerMenuItems.push({
      key: 'speakers',
      text: props.strings.speakerMenuTitle,
      iconProps: { iconName: 'MoreDrawerSpeakers' },
      subMenuProps: props.speakers.map((speaker) => ({
        key: speaker.id,
        iconProps: {
          iconName: isSpeakerSelected(speaker, props.selectedSpeaker)
            ? 'MoreDrawerSelectedSpeaker'
            : 'MoreDrawerSpeakers'
        },
        text: speaker.name
      }))
    });
  }

  drawerMenuItems.push({
    key: 'people',
    text: props.strings.peopleButtonLabel,
    iconProps: { iconName: 'MoreDrawerPeople' },
    onItemClick: props.onPeopleButtonClicked
  });

  return <DrawerMenu items={drawerMenuItems} onLightDismiss={props.onLightDismiss} />;
};

const isSpeakerSelected = (speaker: OptionsDevice, selectedSpeaker?: OptionsDevice): boolean =>
  !!selectedSpeaker && speaker.id === selectedSpeaker.id;
