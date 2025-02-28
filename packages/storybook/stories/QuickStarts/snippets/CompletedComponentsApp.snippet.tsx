import { DEFAULT_COMPONENT_ICONS, FluentThemeProvider } from '@azure/communication-react';
import { Stack, registerIcons } from '@fluentui/react';
import React from 'react';
import { CallingComponents } from './CallingComponents';
import { ChatComponents } from './ChatComponents';

// If you don't want to provide custom icons, you can register the default ones included with the library.
// This will ensure that all the icons are rendered correctly.
registerIcons({ icons: DEFAULT_COMPONENT_ICONS });

function CompletedComponentsApp(): JSX.Element {
  const stackStyle = {
    root: {
      width: '100%'
    }
  };
  return (
    <FluentThemeProvider>
      <Stack horizontal horizontalAlign="space-evenly" styles={stackStyle}>
        <CallingComponents />
        <ChatComponents />
      </Stack>
    </FluentThemeProvider>
  );
}

export default CompletedComponentsApp;
