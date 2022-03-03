// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DefaultButton, mergeStyles, Stack, Text } from '@fluentui/react';
import React from 'react';

/** @private */
export const PowerpointContent = (): JSX.Element => {
  return (
    <Stack horizontalAlign="center" styles={{ root: { padding: '1rem 0.5rem' } }} tokens={{ childrenGap: '0.5rem' }}>
      <Stack.Item>
        <PowerpointIcon />
      </Stack.Item>
      <Stack.Item>
        <Text role="presentation" className={mergeStyles({ fontSize: '1.2rem', fontWeight: '600' })}>
          Edit in <span style={{ color: POWERPOINT_COLOR }}>PowerPoint</span>
        </Text>
      </Stack.Item>
      <Stack.Item styles={{ root: { padding: '1rem 0rem' } }}>
        <Text role="presentation">
          Install the PowerPoint mobile app for editing docs, collaborating with others and more.
        </Text>
      </Stack.Item>
      <Stack.Item styles={{ root: { width: '100%' } }}>
        <InstallPowerpointButton />
      </Stack.Item>
    </Stack>
  );
};

const InstallPowerpointButton = (): JSX.Element => (
  <DefaultButton
    role="presentation"
    className={mergeStyles({
      width: '100%',
      background: POWERPOINT_COLOR,
      color: 'white',
      borderRadius: '0.2rem',
      fontSize: '0.7rem',
      border: 'none',
      ':hover': {
        background: POWERPOINT_COLOR,
        border: 'none',
        color: 'white'
      }
    })}
  >
    Install The PowerPoint App
  </DefaultButton>
);

const POWERPOINT_COLOR = '#C43E1C';

const PowerpointIcon = (): JSX.Element => (
  <svg width="42" height="42" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M57.1563 30.7578V31.2422C57.1376 37.3385 54.7076 43.1798 50.3968 47.4906C46.0861 51.8013 40.2448 54.2313 34.1484 54.25H33.6641C30.6395 54.2493 27.645 53.6497 24.8533 52.4858C22.0616 51.3219 19.5281 49.6168 17.3988 47.4688C17.0888 47.1588 16.7788 46.8294 16.4881 46.5C16.2072 46.19 15.9359 45.8606 15.6744 45.5312C12.4243 41.4781 10.6541 36.4375 10.6563 31.2422V30.7578L33.9063 26.1562L57.1563 30.7578Z"
      fill="#D35230"
    />
    <path
      d="M57.1562 31V30.7791C57.1386 24.6768 54.7067 18.8295 50.3917 14.5146C46.0767 10.1996 40.2294 7.76764 34.1271 7.75H33.9062L31 20.3438L33.9062 31H57.1562Z"
      fill="#FF8F6B"
    />
    <path
      d="M10.6562 30.7791V31H33.9062V7.75H33.6863C27.584 7.76763 21.7366 10.1995 17.4214 14.5145C13.1063 18.8295 10.6741 24.6768 10.6562 30.7791Z"
      fill="#ED6C47"
    />
    <path
      opacity="0.2"
      d="M31.9688 19.6947V45.2116C31.9708 45.3418 31.9577 45.4718 31.93 45.5991C31.8418 46.1231 31.5704 46.5987 31.164 46.9412C30.7577 47.2836 30.243 47.4706 29.7116 47.4688H17.3988C17.0888 47.1588 16.7788 46.8294 16.4881 46.5C16.2072 46.19 15.9359 45.8606 15.6744 45.5313C12.4243 41.4781 10.6541 36.4375 10.6563 31.2422V30.7578C10.6527 25.9773 12.1542 21.3169 14.9478 17.4375H29.7116C30.0081 17.437 30.3019 17.495 30.576 17.6083C30.85 17.7215 31.0991 17.8878 31.3088 18.0975C31.5185 18.3072 31.6847 18.5562 31.798 18.8303C31.9112 19.1044 31.9693 19.3981 31.9688 19.6947Z"
      fill="black"
    />
    <path
      opacity="0.1"
      d="M32.9375 19.6947V43.2741C32.9297 44.1272 32.5873 44.9432 31.984 45.5465C31.3807 46.1498 30.5647 46.4922 29.7116 46.5H16.4881C16.2072 46.19 15.9359 45.8606 15.6744 45.5312C12.4243 41.4781 10.6541 36.4375 10.6563 31.2422V30.7578C10.6527 25.9772 12.1542 21.3169 14.9478 17.4375C15.1728 17.102 15.4153 16.7787 15.6744 16.4688H29.7116C30.5662 16.4718 31.3849 16.8127 31.9893 17.417C32.5936 18.0213 32.9344 18.8401 32.9375 19.6947Z"
      fill="black"
    />
    <path
      opacity="0.2"
      d="M31.9688 19.6947V43.2741C31.9693 43.5706 31.9112 43.8644 31.798 44.1385C31.6847 44.4125 31.5185 44.6616 31.3088 44.8713C31.0991 45.081 30.85 45.2472 30.576 45.3605C30.3019 45.4737 30.0081 45.5318 29.7116 45.5313H15.6744C12.4243 41.4781 10.6541 36.4375 10.6563 31.2422V30.7578C10.6527 25.9773 12.1542 21.3169 14.9478 17.4375H29.7116C30.0081 17.437 30.3019 17.495 30.576 17.6083C30.85 17.7215 31.0991 17.8878 31.3088 18.0975C31.5185 18.3072 31.6847 18.5562 31.798 18.8303C31.9112 19.1044 31.9693 19.3981 31.9688 19.6947Z"
      fill="black"
    />
    <path
      opacity="0.1"
      d="M31 19.6947V43.2741C31.0005 43.5706 30.9425 43.8644 30.8292 44.1385C30.716 44.4125 30.5497 44.6616 30.34 44.8713C30.1303 45.081 29.8813 45.2472 29.6072 45.3605C29.3331 45.4737 29.0394 45.5318 28.7428 45.5313H15.6744C12.4243 41.4781 10.6541 36.4375 10.6563 31.2422V30.7578C10.6527 25.9773 12.1542 21.3169 14.9478 17.4375H28.7428C29.0394 17.437 29.3331 17.495 29.6072 17.6083C29.8813 17.7215 30.1303 17.8878 30.34 18.0975C30.5497 18.3072 30.716 18.5562 30.8292 18.8303C30.9425 19.1044 31.0005 19.3981 31 19.6947Z"
      fill="black"
    />
    <path
      d="M28.7389 17.4375H6.13606C4.88731 17.4375 3.875 18.4498 3.875 19.6986V42.3014C3.875 43.5502 4.88731 44.5625 6.13606 44.5625H28.7389C29.9877 44.5625 31 43.5502 31 42.3014V19.6986C31 18.4498 29.9877 17.4375 28.7389 17.4375Z"
      fill="url(#paint0_linear_413_6461)"
    />
    <path
      d="M17.886 23.4021C19.329 23.3043 20.7584 23.7339 21.9083 24.6111C22.3868 25.0536 22.7605 25.5974 23.002 26.2027C23.2435 26.8081 23.3468 27.4598 23.3042 28.1102C23.3208 29.0291 23.082 29.9345 22.6145 30.7258C22.1461 31.4971 21.464 32.116 20.6508 32.5073C19.7312 32.9471 18.7211 33.1647 17.702 33.1428H14.911V38.471H12.0483V23.4021H17.886ZM14.911 30.843H17.3745C18.1583 30.9003 18.9352 30.6622 19.5523 30.1756C19.8081 29.9227 20.0063 29.6175 20.1334 29.2809C20.2605 28.9444 20.3134 28.5844 20.2885 28.2255C20.2885 26.5657 19.3479 25.7358 17.4666 25.7358H14.911V30.843Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id="paint0_linear_413_6461"
        x1="8.58894"
        y1="15.6734"
        x2="26.2861"
        y2="46.3266"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#CA4C28" />
        <stop offset="0.5" stopColor="#C5401E" />
        <stop offset="1" stopColor="#B62F14" />
      </linearGradient>
    </defs>
  </svg>
);
