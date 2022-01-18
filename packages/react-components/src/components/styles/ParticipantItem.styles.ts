// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { mergeStyles } from '@fluentui/react';

const MINIMUM_TOUCH_TARGET_HEIGHT_REM = 3;

/**
 * @private
 */
export const participantItemContainerStyle = mergeStyles({
  paddingTop: '0.25rem',
  paddingBottom: '0.25rem',
  display: 'flex',
  maxWidth: '20rem',
  minWidth: '12rem',
  cursor: 'pointer',
  alignItems: 'center'
});

/**
 * @private
 */
export const menuButtonContainerStyle = {
  width: '1.5rem'
};

/**
 * @private
 */
export const iconContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  paddingTop: '0.2rem'
};

/**
 * @private
 */
export const iconStyles = mergeStyles({
  display: 'flex',
  lineHeight: 0, // ensure the icon center is on the center line and not slightly above it
  alignItems: 'center'
});

/**
 * @private
 */
export const meContainerStyle = {
  paddingRight: '0.5rem'
};

/**
 * Styles that can be applied to ensure Participant items have the minimum touch target size.
 *
 * @private
 */
export const participantItemIncreasedSizeStyles = mergeStyles({
  height: `${MINIMUM_TOUCH_TARGET_HEIGHT_REM}rem`,
  lineHeight: `${MINIMUM_TOUCH_TARGET_HEIGHT_REM}rem`
});
