// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IButtonStyles, IStackItemStyles, getTheme } from '@fluentui/react';

const theme = getTheme();
const palette = theme.palette;

export const sidePaneContainerStyles: IStackItemStyles = {
  root: {
    height: '100%'
  }
};

export const sidePaneHeaderStyles: IStackItemStyles = {
  root: {
    fontSize: '0.825rem',
    lineHeight: '1.25rem',
    padding: '0.25rem',
    fontWeight: '600'
  }
};

export const sidePaneBodyStyles: IButtonStyles = {
  root: {
    height: '100%'
  }
};

export const peopleSubheadingStyle: IStackItemStyles = {
  root: {
    fontSize: '0.75rem',
    color: palette.neutralSecondary
  }
};
