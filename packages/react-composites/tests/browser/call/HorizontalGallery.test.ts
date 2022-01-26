// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { test } from './fixture';
import { expect } from '@playwright/test';
import { buildUrlWithMockAdapter } from './utils';
import { dataUiId, pageClick, waitForPageFontsLoaded, waitForSelector } from '../common/utils';
import { TestRemoteParticipant } from './TestCallingState';
import { IDS } from '../common/constants';

const defaultTestRemoteParticipants: TestRemoteParticipant[] = [
  {
    displayName: 'Paul Bridges',
    isSpeaking: true,
    isVideoStreamAvailable: true
  },
  {
    displayName: 'Eryka Klein'
  },
  {
    displayName: 'Fiona Harper',
    isVideoStreamAvailable: true
  }
];

test.describe('HorizontalGallery tests', async () => {
  test('HorizontalGallery should have 1 audio participant', async ({ pages, serverUrl }) => {
    const page = pages[0];
    await page.goto(
      buildUrlWithMockAdapter(serverUrl, {
        remoteParticipants: defaultTestRemoteParticipants
      })
    );
    // Click off the screen to turn away initial aria label
    await page.mouse.click(-1, -1);
    await waitForPageFontsLoaded(page);
    expect(await page.screenshot()).toMatchSnapshot('horizontal-gallery.png');
  });

  test('HorizontalGallery should have multiple audio participants spanning multiple pages. Navigation buttons should work.', async ({
    pages,
    serverUrl
  }) => {
    const page = pages[0];
    const testRemoteParticipants = defaultTestRemoteParticipants.concat([
      {
        displayName: 'Pardeep Singh'
      },
      {
        displayName: 'Reina Takizawa',
        isSpeaking: true
      },
      {
        displayName: 'Vasily Podkolzin',
        isMuted: true
      },
      {
        displayName: 'Luciana Rodriguez'
      },
      {
        displayName: 'Antonie van Leeuwenhoek'
      },
      {
        displayName: 'Gerald Ho'
      }
    ]);
    await page.goto(
      buildUrlWithMockAdapter(serverUrl, {
        remoteParticipants: testRemoteParticipants
      })
    );
    // Click off the screen to turn away initial aria label
    await page.mouse.click(-1, -1);
    await waitForPageFontsLoaded(page);
    expect(await page.screenshot()).toMatchSnapshot('horizontal-gallery-page-1.png');
    await waitForSelector(page, dataUiId(IDS.horizontalGalleryRightNavButton));
    await pageClick(page, dataUiId(IDS.horizontalGalleryRightNavButton));
    expect(await page.screenshot()).toMatchSnapshot('horizontal-gallery-page-2.png');
    await waitForSelector(page, dataUiId(IDS.horizontalGalleryLeftNavButton));
    await pageClick(page, dataUiId(IDS.horizontalGalleryLeftNavButton));
    expect(await page.screenshot()).toMatchSnapshot('horizontal-gallery-page-1.png');
  });
});
