// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { ChatMessage, CustomMessage, _IdentifierProvider } from '@internal/react-components';
import {
  ChatAdapter,
  createAzureCommunicationChatAdapter,
  ChatComposite,
  COMPOSITE_LOCALE_FR_FR
} from '../../../../src';
import { IDS } from '../../common/config';

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const displayName = params.displayName;
const token = params.token;
const endpointUrl = params.endpointUrl;
const threadId = params.threadId;
const userId = params.userId;
const useFrLocale = Boolean(params.useFrLocale);
const customDataModel = params.customDataModel;

function App(): JSX.Element {
  const [chatAdapter, setChatAdapter] = useState<ChatAdapter | undefined>(undefined);

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      setChatAdapter(
        await createAzureCommunicationChatAdapter({
          endpointUrl,
          userId: { kind: 'communicationUser', communicationUserId: userId },
          displayName,
          credential: new AzureCommunicationTokenCredential(token),
          threadId
        })
      );
    };

    initialize();

    return () => chatAdapter && chatAdapter.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <_IdentifierProvider identifiers={IDS}>
      {chatAdapter && (
        <ChatComposite
          adapter={chatAdapter}
          onRenderTypingIndicator={
            customDataModel
              ? () => <text id="custom-data-model-typing-indicator">SOMEONE IS TYPING...</text>
              : undefined
          }
          onRenderMessage={
            customDataModel
              ? (messageProps) => (
                  <text
                    data-ui-status={messageProps.message.type === 'chat' ? messageProps.message.payload.status : ''}
                    id="custom-data-model-message"
                  >
                    {messageProps.message.type === 'chat' || messageProps.message.type === 'custom'
                      ? (messageProps.message as ChatMessage | CustomMessage).payload.content.toLocaleUpperCase()
                      : messageProps.message.type === 'system'
                      ? 'SYSTEM MESSAGE'
                      : 'MESSAGE'}
                  </text>
                )
              : undefined
          }
          onFetchAvatarPersonaData={
            customDataModel
              ? () =>
                  new Promise((resolve) =>
                    resolve({
                      imageInitials: 'CN',
                      text: 'CUSTOM NAME'
                    })
                  )
              : undefined
          }
          locale={useFrLocale ? COMPOSITE_LOCALE_FR_FR : undefined}
        />
      )}
    </_IdentifierProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
