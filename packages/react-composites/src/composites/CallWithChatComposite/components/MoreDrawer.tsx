// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useCallback } from 'react';
/* @conditional-compile-remove(control-bar-button-injection) */
import { useMemo } from 'react';
import {
  OptionsDevice,
  _DrawerMenu as DrawerMenu,
  _DrawerMenuItemProps as DrawerMenuItemProps,
  _DrawerMenuItemProps
} from '@internal/react-components';
/* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
import { HoldButton } from '@internal/react-components';
import { AudioDeviceInfo } from '@azure/communication-calling';
import { CallWithChatControlOptions } from '../CallWithChatComposite';
/* @conditional-compile-remove(control-bar-button-injection) */
import {
  CUSTOM_BUTTON_OPTIONS,
  generateCustomCallWithChatDrawerButtons,
  onFetchCustomButtonPropsTrampoline
} from '../CustomButton';
/* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
import { usePropsFor } from '../../CallComposite/hooks/usePropsFor';
/* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
import { useLocale } from '../../localization';
import { isDisabled } from '../../CallComposite/utils';

/** @private */
export interface MoreDrawerStrings {
  /**
   * Label for people drawerMenuItem.
   */
  peopleButtonLabel: string;
  /**
   * Label for audio device drawerMenuItem.
   *
   * @remarks This replaces the microphoneMenuTitle speakers can not be enumerated
   *
   */
  audioDeviceMenuTitle?: string;
  /**
   * Label for microphone drawerMenuItem.
   *
   * @remarks Only displayed when speakers can be enumerated otherwise audioDeviceMenuTitle is used
   *
   */
  microphoneMenuTitle: string;
  /**
   * Label for speaker drawerMenuItem.
   *
   * @remarks Only displayed when speakers can be enumerated
   *
   */
  speakerMenuTitle: string;
}

/** @private */
export interface MoreDrawerDevicesMenuProps {
  /**
   * Available microphones for selection
   */
  microphones?: OptionsDevice[];
  /**
   * Available speakers for selection
   */
  speakers?: OptionsDevice[];
  /**
   * Microphone that is shown as currently selected
   */
  selectedMicrophone?: OptionsDevice;
  /**
   * Speaker that is shown as currently selected
   */
  selectedSpeaker?: OptionsDevice;
  /**
   * Speaker when a speaker is selected
   */
  onSelectSpeaker: (device: AudioDeviceInfo) => Promise<void>;
  /**
   * Callback when a microphone is selected
   */
  onSelectMicrophone: (device: AudioDeviceInfo) => Promise<void>;
}

/** @private */
export interface MoreDrawerProps extends MoreDrawerDevicesMenuProps {
  onLightDismiss: () => void;
  onPeopleButtonClicked: () => void;
  callControls?: boolean | CallWithChatControlOptions;
  onClickShowDialpad?: () => void;
  strings: MoreDrawerStrings;
  disableButtonsForHoldScreen?: boolean;
}

const inferCallWithChatControlOptions = (
  callWithChatControls?: boolean | CallWithChatControlOptions
): CallWithChatControlOptions | false => {
  if (callWithChatControls === false) {
    return false;
  }
  const options = callWithChatControls === true || callWithChatControls === undefined ? {} : callWithChatControls;
  return options;
};

/** @private */
export const MoreDrawer = (props: MoreDrawerProps): JSX.Element => {
  const drawerMenuItems: DrawerMenuItemProps[] = [];

  const { speakers, onSelectSpeaker, onLightDismiss } = props;

  /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
  const localeStrings = useLocale();
  /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
  const holdButtonProps = usePropsFor(HoldButton);

  const onSpeakerItemClick = useCallback(
    (_ev, itemKey) => {
      const selected = speakers?.find((speaker) => speaker.id === itemKey);
      if (selected) {
        // This is unsafe - we're only passing in part of the argument to the handler.
        // But this is a known issue in our state.
        onSelectSpeaker(selected as AudioDeviceInfo);
      }
      onLightDismiss();
    },
    [speakers, onSelectSpeaker, onLightDismiss]
  );

  const drawerSelectionOptions = inferCallWithChatControlOptions(props.callControls);

  if (props.speakers && props.speakers.length > 0) {
    drawerMenuItems.push({
      itemKey: 'speakers',
      disabled: props.disableButtonsForHoldScreen,
      text: props.strings.speakerMenuTitle,
      iconProps: { iconName: 'MoreDrawerSpeakers' },
      subMenuProps: props.speakers.map((speaker) => ({
        itemKey: speaker.id,
        iconProps: {
          iconName: isDeviceSelected(speaker, props.selectedSpeaker)
            ? 'MoreDrawerSelectedSpeaker'
            : 'MoreDrawerSpeakers'
        },
        text: speaker.name,
        onItemClick: onSpeakerItemClick,
        secondaryIconProps: isDeviceSelected(speaker, props.selectedSpeaker) ? { iconName: 'Accept' } : undefined
      })),
      secondaryText: props.selectedSpeaker?.name
    });
  }

  const { microphones, onSelectMicrophone } = props;
  const onMicrophoneItemClick = useCallback(
    (_ev, itemKey) => {
      const selected = microphones?.find((mic) => mic.id === itemKey);
      if (selected) {
        // This is unsafe - we're only passing in part of the argument to the handler.
        // But this is a known issue in our state.
        onSelectMicrophone(selected as AudioDeviceInfo);
      }
      onLightDismiss();
    },
    [microphones, onSelectMicrophone, onLightDismiss]
  );

  if (props.microphones && props.microphones.length > 0) {
    // Set props as Microphone if speakers can be enumerated else set as Audio Device
    const speakersAvailable = props.speakers && props.speakers.length > 0;
    const itemKey = speakersAvailable ? 'microphones' : 'audioDevices';
    const text = speakersAvailable ? props.strings.microphoneMenuTitle : props.strings.audioDeviceMenuTitle;
    const iconName = speakersAvailable ? 'MoreDrawerMicrophones' : 'MoreDrawerSpeakers';
    const selectedIconName = speakersAvailable ? 'MoreDrawerSelectedMicrophone' : 'MoreDrawerSelectedSpeaker';

    drawerMenuItems.push({
      itemKey: itemKey,
      disabled: props.disableButtonsForHoldScreen,
      text: text,
      iconProps: { iconName: iconName },
      subMenuProps: props.microphones.map((mic) => ({
        itemKey: mic.id,
        iconProps: {
          iconName: isDeviceSelected(mic, props.selectedMicrophone) ? selectedIconName : iconName
        },
        text: mic.name,
        onItemClick: onMicrophoneItemClick,
        secondaryIconProps: isDeviceSelected(mic, props.selectedMicrophone) ? { iconName: 'Accept' } : undefined,
        disabled: drawerSelectionOptions !== false ? isDisabled(drawerSelectionOptions.microphoneButton) : undefined
      })),
      secondaryText: props.selectedMicrophone?.name
    });
  }
  if (drawerSelectionOptions !== false && isEnabled(drawerSelectionOptions?.peopleButton)) {
    drawerMenuItems.push({
      itemKey: 'people',
      text: props.strings.peopleButtonLabel,
      iconProps: { iconName: 'MoreDrawerPeople' },
      onItemClick: props.onPeopleButtonClicked,
      disabled: drawerSelectionOptions !== false ? isDisabled(drawerSelectionOptions.peopleButton) : undefined
    });
  }

  /* @conditional-compile-remove(PSTN-calls) */ /* @conditional-compile-remove(one-to-n-calling) */
  if (drawerSelectionOptions !== false && isEnabled(drawerSelectionOptions?.holdButton)) {
    drawerMenuItems.push({
      itemKey: 'holdButtonKey',
      disabled:
        props.disableButtonsForHoldScreen ||
        (drawerSelectionOptions !== false ? isDisabled(drawerSelectionOptions.holdButton) : undefined),
      text: localeStrings.component.strings.holdButton.tooltipOffContent,
      onItemClick: () => {
        holdButtonProps.onToggleHold();
      },
      iconProps: { iconName: 'HoldCallContextualMenuItem', styles: { root: { lineHeight: 0 } } }
    });
  }

  /*@conditional-compile-remove(PSTN-calls) */
  // dtmf tone sending only works for 1:1 PSTN call
  if (drawerSelectionOptions !== false && props.onClickShowDialpad) {
    drawerMenuItems.push({
      itemKey: 'showDialpadKey',
      disabled: props.disableButtonsForHoldScreen,
      text: localeStrings.strings.callWithChat.openDtmfDialpadLabel,
      onItemClick: () => {
        props.onClickShowDialpad && props.onClickShowDialpad();
      },
      iconProps: { iconName: 'Dialpad', styles: { root: { lineHeight: 0 } } }
    });
  }

  /* @conditional-compile-remove(control-bar-button-injection) */
  const customDrawerButtons = useMemo(
    () =>
      generateCustomCallWithChatDrawerButtons(
        onFetchCustomButtonPropsTrampoline(drawerSelectionOptions !== false ? drawerSelectionOptions : undefined),
        drawerSelectionOptions !== false ? drawerSelectionOptions?.displayType : undefined
      ),
    [drawerSelectionOptions]
  );

  /* @conditional-compile-remove(control-bar-button-injection) */
  customDrawerButtons['overflow']?.props.children.forEach((element) => {
    drawerMenuItems.push(element);
  });
  /* @conditional-compile-remove(control-bar-button-injection) */
  customDrawerButtons['primary']?.props.children
    .slice(CUSTOM_BUTTON_OPTIONS.MAX_PRIMARY_MOBILE_CUSTOM_BUTTONS)
    .forEach((element) => {
      drawerMenuItems.push(element);
    });
  /* @conditional-compile-remove(control-bar-button-injection) */
  customDrawerButtons['secondary']?.props.children.forEach((element) => {
    drawerMenuItems.push(element);
  });

  return <DrawerMenu items={drawerMenuItems} onLightDismiss={props.onLightDismiss} />;
};

const isDeviceSelected = (speaker: OptionsDevice, selectedSpeaker?: OptionsDevice): boolean =>
  !!selectedSpeaker && speaker.id === selectedSpeaker.id;

const isEnabled = (option: unknown): boolean => option !== false;
