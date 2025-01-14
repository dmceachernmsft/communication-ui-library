// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ControlBarButtonStyles, DevicesButton } from '@internal/react-components';
/* @conditional-compile-remove(rooms) */
import { _usePermissions, _Permissions, DevicesButtonStrings } from '@internal/react-components';
import React, { useMemo } from 'react';
import { usePropsFor } from '../../hooks/usePropsFor';
import { CallControlDisplayType } from '../../types/CallControlOptions';
import { concatButtonBaseStyles, devicesButtonWithIncreasedTouchTargets } from '../../styles/Buttons.styles';
/* @conditional-compile-remove(rooms) */
import { CompositeLocale, useLocale } from '../../../localization';

/** @private */
export const Devices = (props: {
  displayType?: CallControlDisplayType;
  increaseFlyoutItemSize?: boolean;
  styles?: ControlBarButtonStyles;
  disabled?: boolean;
}): JSX.Element => {
  const devicesButtonProps = usePropsFor(DevicesButton);
  const styles = useMemo(
    () =>
      concatButtonBaseStyles(
        props.increaseFlyoutItemSize ? devicesButtonWithIncreasedTouchTargets : {},
        props.styles ?? {}
      ),
    [props.increaseFlyoutItemSize, props.styles]
  );

  /* @conditional-compile-remove(rooms) */
  const permissions = _usePermissions();
  /* @conditional-compile-remove(rooms) */
  const locale = useLocale();

  return (
    <DevicesButton
      /* By setting `persistMenu?` to true, we prevent options menu from getting hidden every time a participant joins or leaves. */
      persistMenu={true}
      {...devicesButtonProps}
      showLabel={props.displayType !== 'compact'}
      styles={styles}
      data-ui-id="calling-composite-devices-button"
      disabled={props.disabled}
      /* @conditional-compile-remove(rooms) */
      strings={getLabelFromPermissions(permissions, locale)}
    />
  );
};

/* @conditional-compile-remove(rooms) */
const getLabelFromPermissions = (
  permissions: _Permissions,
  locale: CompositeLocale
): Partial<DevicesButtonStrings> | undefined => {
  if (!permissions.cameraButton && !permissions.microphoneButton) {
    return { label: locale.component.strings.microphoneButton.speakerMenuTitle };
  }
  return undefined;
};
