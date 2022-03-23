import { concatStyleSets, Stack, useTheme } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { ControlBarButton, ControlBarButtonStyles } from '@internal/react-components';
import { CallAdapter } from '../CallComposite';

export type ReactionOptions = {
  laugh: boolean;
  clap: boolean;
  heart: boolean;
  wow: boolean;
  raiseHand: boolean;
};

export interface CallWithChatReactionsControlBarProps {
  reactions: ReactionOptions;
  callAdapter: CallAdapter;
  localParticipantID: string;
  onReaction: (type: string, user: string) => Promise<void>; // callback function for sending reactions
}

export const CallWithChatReactionsControlBar = (props: CallWithChatReactionsControlBarProps): JSX.Element => {
  const { reactions, localParticipantID, onReaction } = props;
  // use the props to show different reactions
  const theme = useTheme();
  const user = localParticipantID;
  const styles: ControlBarButtonStyles = useMemo(
    () =>
      concatStyleSets({
        rootChecked: {
          background: theme.palette.neutralLight
        }
      }),
    [theme.palette.neutralLight]
  );

  const onRenderRaiseHandIcon = useCallback((): JSX.Element => {
    return <>🖐️</>;
  }, []);
  const onRenderHeartIcon = useCallback((): JSX.Element => {
    return <>❤️</>;
  }, []);
  const onRenderClapIcon = useCallback((): JSX.Element => {
    return <>👏</>;
  }, []);
  const onRenderWowIcon = useCallback((): JSX.Element => {
    return <>😀</>;
  }, []);
  const onRenderLaughIcon = useCallback((): JSX.Element => {
    return <>😂</>;
  }, []);
  return (
    <Stack horizontalAlign={'center'}>
      {reactions.raiseHand && (
        <ControlBarButton
          onClick={onReaction('Raise hand', user)}
          strings={{ label: 'Raise Hand' }}
          styles={styles}
          onRenderOffIcon={onRenderRaiseHandIcon}
        ></ControlBarButton>
      )}
      {reactions.clap && (
        <ControlBarButton
          onClick={onReaction('Clap', user)}
          strings={{ label: 'clap' }}
          styles={styles}
          onRenderOffIcon={onRenderClapIcon}
        ></ControlBarButton>
      )}
      {reactions.wow && (
        <ControlBarButton
          onClick={onReaction('Suprised', user)}
          strings={{ label: 'wow' }}
          styles={styles}
          onRenderOffIcon={onRenderWowIcon}
        ></ControlBarButton>
      )}
      {reactions.heart && (
        <ControlBarButton
          onClick={onReaction('Heart', user)}
          strings={{ label: 'heart' }}
          styles={styles}
          onRenderOffIcon={onRenderHeartIcon}
        ></ControlBarButton>
      )}
      {reactions.laugh && (
        <ControlBarButton
          onClick={onReaction('Laugh', user)}
          strings={{ label: 'laugh' }}
          styles={styles}
          onRenderOffIcon={onRenderLaughIcon}
        ></ControlBarButton>
      )}
    </Stack>
  );
};
