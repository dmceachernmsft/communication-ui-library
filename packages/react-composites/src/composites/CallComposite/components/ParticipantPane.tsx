// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ChevronLeft28Regular } from '@fluentui/react-icons';
import { Stack, DefaultButton } from '@fluentui/react';
import React from 'react';
import { AvatarPersonaDataCallback } from '../..';
import { ParticipantListWithHeading } from '../../common/ParticipantContainer';
import { usePropsFor } from '../../CallComposite/hooks/usePropsFor';
import { ParticipantList } from '@internal/react-components';
import { useLocale } from '../../localization';
import {
  participantPaneHiddenStyles,
  participantPaneStyles,
  participantPaneHeaderStyles,
  participantPaneBackHeaderButtonStyles,
  participantPaneHeaderTitleStyles
} from '../styles/ParticipantPane.styles';

/**
 * Props of {@link ParticipantPane} component
 */
export type ParticipantPaneProps = {
  hidden: boolean;
  closePane: () => void;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
};

/**
 * ParticipantList component covering entire screen with a header and back button
 * @param props - ParticipantPaneProps
 * @private
 */
export const ParticipantPane = (props: ParticipantPaneProps): JSX.Element => {
  const { hidden, closePane, onFetchAvatarPersonaData } = props;
  const participantListProps = usePropsFor(ParticipantList);
  const locale = useLocale();

  return (
    <Stack verticalFill grow className={hidden ? participantPaneHiddenStyles : participantPaneStyles}>
      <Stack horizontal grow styles={participantPaneHeaderStyles}>
        <DefaultButton
          onClick={closePane}
          styles={participantPaneBackHeaderButtonStyles}
          onRenderIcon={() => <ChevronLeft28Regular />}
        />
        <Stack styles={participantPaneHeaderTitleStyles}>{locale.strings.call.peoplePaneTitle}</Stack>
      </Stack>
      <ParticipantListWithHeading
        participantListProps={participantListProps}
        onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        title={locale.strings.call.peoplePaneSubTitle}
      />
    </Stack>
  );
};