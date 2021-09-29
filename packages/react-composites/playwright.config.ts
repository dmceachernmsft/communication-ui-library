// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

/** This should always be set to the minimum desktop viewport size all composites support. */
const DESKTOP_MIN_SUPPORTED_VIEWPORT = {
  width: 1024,
  height: 768
};

const config: PlaywrightTestConfig = {
  timeout: 120000, // Allow for more than the standard 30000. This ensures we get debug stack traces when await functions timeout.
  workers: 1, // Ensure tests run sequentially.
  use: {
    headless: true,
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: DESKTOP_MIN_SUPPORTED_VIEWPORT,
        launchOptions: {
          args: [
            '--font-render-hinting=medium', // Ensures that fonts are rendered consistently.
            '--enable-font-antialiasing', // Ensures that fonts are rendered consistently.
            '--disable-gpu', // Ensures that fonts are rendered consistently.
            '--allow-file-access',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            `--use-file-for-fake-video-capture=${path.join(__dirname, 'tests', 'browser', 'common', 'test.y4m')}`,
            '--lang=en-US',
            '--mute-audio'
          ],
          ignoreDefaultArgs: [
            '--hide-scrollbars' // Do not hide scrollbars in headless mode.
          ]
        }
      }
    }
  ]
};
export default config;
