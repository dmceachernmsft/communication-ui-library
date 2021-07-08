import { ErrorBar } from '@internal/react-composites';
import React from 'react';

export const ErrorBarExample: () => JSX.Element = () => {
  const message = 'Something went wrong';
  const onClearError = (): void => alert('closed error bar');
  return <ErrorBar message={message} onClose={onClearError} />;
};
