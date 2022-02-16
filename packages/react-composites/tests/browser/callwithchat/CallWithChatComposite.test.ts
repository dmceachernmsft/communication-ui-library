// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IDS, TEST_PARTICIPANTS } from '../common/constants';
import {
  buildUrl,
  dataUiId,
  loadCallPageWithParticipantVideos,
  pageClick,
  stubMessageTimestamps,
  waitForCallWithChatCompositeToLoad,
  waitForSelector
} from '../common/utils';
import { test } from './fixture';
import { expect, Page } from '@playwright/test';
import { sendMessage, waitForMessageDelivered, waitForMessageSeen } from '../common/chatTestHelpers';
import { createCallWithChatObjectsAndUsers } from '../common/fixtureHelpers';
import { CallWithChatUserType } from '../common/fixtureTypes';

test.describe('CallWithChat Composite Pre-Join Tests', () => {
  test.beforeEach(async ({ pages, users, serverUrl }) => {
    await callWithChatTestSetup({ pages, users, serverUrl });
  });

  test('Pre-join screen loads correctly', async ({ pages }) => {
    const page = pages[0];
    expect(await page.screenshot()).toMatchSnapshot(`call-with-chat-pre-join-screen.png`);
  });
});

test.describe('CallWithChat Composite CallWithChat Page Tests', () => {
  test.beforeEach(async ({ pages, users, serverUrl }) => {
    await callWithChatTestSetup({ pages, users, serverUrl });
    await loadCallPageWithParticipantVideos(pages);
  });

  test('CallWithChat gallery screen loads correctly', async ({ pages }) => {
    const page = pages[0];
    expect(await page.screenshot()).toMatchSnapshot(`call-with-chat-gallery-screen.png`);
  });

  test('Chat messages are displayed correctly', async ({ pages }) => {
    // Open chat pane on page 0 and send a message
    await pageClick(pages[0], dataUiId('call-with-chat-composite-chat-button'));
    await waitForSelector(pages[0], dataUiId('call-with-chat-composite-chat-pane'));
    await sendMessage(pages[0], 'Call with Chat composite is awesome!');

    // Open chat pane on page 1 and send a response
    await pageClick(pages[1], dataUiId('call-with-chat-composite-chat-button'));
    await waitForSelector(pages[1], dataUiId('call-with-chat-composite-chat-pane'));
    await sendMessage(pages[1], 'I agree!');
    await waitForMessageDelivered(pages[1]);

    // Test page 0 has both sent message and received message
    await waitForMessageSeen(pages[0]);
    await waitForMessageSeen(pages[1]);

    // Ensure typing indicator has disappeared to prevent flakey test
    await pages[0].bringToFront();
    const typingIndicator = await pages[0].$(dataUiId(IDS.typingIndicator));
    typingIndicator && (await typingIndicator.waitForElementState('hidden'));

    await stubMessageTimestamps(pages[0]);
    expect(await pages[0].screenshot()).toMatchSnapshot(`call-with-chat-gallery-screen-with-chat-pane.png`);
  });

  test('People pane opens and displays correctly', async ({ pages }) => {
    const page = pages[1];
    await pageClick(page, dataUiId('call-with-chat-composite-people-button'));
    await waitForSelector(page, dataUiId('call-with-chat-composite-people-pane'));
    expect(await page.screenshot()).toMatchSnapshot(`call-with-chat-gallery-screen-with-people-pane.png`);
  });
});

export const callWithChatTestSetup = async ({
  pages,
  users,
  serverUrl,
  qArgs
}: {
  pages: Page[];
  users: CallWithChatUserType[];
  serverUrl: string;
  /** optional query parameters for the page url */
  qArgs?: { [key: string]: string };
}): Promise<void> => {
  // ensure calls and chats are always unique per test
  users = await createCallWithChatObjectsAndUsers(TEST_PARTICIPANTS);
  for (const i in pages) {
    const page = pages[i];
    const user = users[i];
    await page.goto(buildUrl(serverUrl, user, qArgs));
    await waitForCallWithChatCompositeToLoad(page);
  }
};