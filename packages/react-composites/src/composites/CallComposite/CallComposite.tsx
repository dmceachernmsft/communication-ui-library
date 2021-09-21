// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { OnRenderAvatarCallback } from '@internal/react-components';
import React, { useEffect } from 'react';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { BaseComposite, BaseCompositeProps } from '../common/Composite';
import { CallCompositeIcons } from '../common/icons';
import { useLocale } from '../localization';
import { CallAdapter, CallCompositePage } from './adapter/CallAdapter';
import { CallAdapterProvider, useAdapter } from './adapter/CallAdapterProvider';
import { CallControlOptions } from './CallControls';
import { CallScreen } from './CallScreen';
import { ConfigurationScreen } from './ConfigurationScreen';
import { Error } from './Error';
import { useSelector } from './hooks/useSelector';
import { getPage } from './selectors/baseSelectors';

export interface CallCompositeProps extends BaseCompositeProps<CallCompositeIcons> {
  /**
   * An adapter provides logic and data to the composite.
   * Composite can also be controlled using the adapter.
   */
  adapter: CallAdapter;
  callInvitationURL?: string;
  /**
   * A callback function that can be used to provide custom data to an Avatar.
   */
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  /**
   * Flags to hide UI elements of the {@link CallComposite}.
   */
  options?: CallCompositeOptions;
}

/**
 * Optional features of the {@link CallComposite}
 */
export type CallCompositeOptions = {
  /**
   * Choose to use the composite form optimized for use on a mobile device.
   * @remarks This is currently only optimized for portrait mode on mobile devices.
   * @defaultValue false
   * @alpha
   */
  mobileView: boolean;
  /**
   * Surface Azure Communication Services backend errors in the UI with {@link @azure/communication-react#ErrorBar}.
   * Hide or show the error bar.
   * @defaultValue true
   */
  errorBar?: boolean;
  /**
   * Hide or Customize the control bar element.
   * Can be customized by providing an object of type {@link @azure/communication-react#CallControlOptions}.
   * @defaultValue true
   */
  callControls?: boolean | CallControlOptions;
};

type MainScreenProps = {
  onRenderAvatar?: OnRenderAvatarCallback;
  callInvitationURL?: string;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  options?: CallCompositeOptions;
};

const MainScreen = (props: MainScreenProps): JSX.Element => {
  const { callInvitationURL, onRenderAvatar, onFetchAvatarPersonaData } = props;
  const page = useSelector(getPage);
  const adapter = useAdapter();
  const locale = useLocale();
  switch (page) {
    case 'configuration':
      return <ConfigurationScreen startCallHandler={(): void => adapter.setPage('call')} />;
    case 'error':
      return <Error rejoinHandler={() => adapter.setPage('configuration')} />;
    case 'errorJoiningTeamsMeeting':
      return (
        <Error
          rejoinHandler={() => adapter.setPage('configuration')}
          title={locale.strings.call.teamsMeetingFailToJoin}
          reason={locale.strings.call.teamsMeetingFailReasonAccessDenied}
        />
      );
    case 'removed':
      return (
        <Error
          rejoinHandler={() => adapter.setPage('configuration')}
          title={locale.strings.call.teamsMeetingFailToJoin}
          reason={locale.strings.call.teamsMeetingFailReasonParticipantRemoved}
        />
      );
    default:
      return (
        <CallScreen
          endCallHandler={async (): Promise<void> => {
            adapter.setPage('configuration');
          }}
          callErrorHandler={(customPage?: CallCompositePage) => {
            customPage ? adapter.setPage(customPage) : adapter.setPage('error');
          }}
          onRenderAvatar={onRenderAvatar}
          callInvitationURL={callInvitationURL}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          options={props.options}
        />
      );
  }
};

export const CallComposite = (props: CallCompositeProps): JSX.Element => {
  const { adapter, callInvitationURL, onFetchAvatarPersonaData, options } = props;
  useEffect(() => {
    (async () => {
      await adapter.askDevicePermission({ video: true, audio: true });
      adapter.queryCameras();
      adapter.queryMicrophones();
      adapter.querySpeakers();
    })();
  }, [adapter]);
  return (
    <BaseComposite {...props}>
      <CallAdapterProvider adapter={adapter}>
        <MainScreen
          callInvitationURL={callInvitationURL}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          options={options}
        />
      </CallAdapterProvider>
    </BaseComposite>
  );
};
