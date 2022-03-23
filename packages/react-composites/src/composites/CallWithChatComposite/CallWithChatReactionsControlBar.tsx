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
}

export const CallWithChatReactionsControlBar = (props: CallWithChatReactionsControlBarProps): JSX.Element => {
  // use the props to show different reactions
  const theme = useTheme();
  const user = props.localParticipantID;
  const styles: ControlBarButtonStyles = useMemo(
    () =>
      concatStyleSets({
        rootChecked: {
          background: theme.palette.neutralLight
        }
      }),
    [theme.palette.neutralLight]
  );
  const onReaction = (reaction: string, participant: string): void => {
    // so now we need to find out how to make requests to the Teams api
    // we want to send a reaction to the following graphQL? -> can we even make this request? how do we authenticate it?
    // subscription callParticipantsReactionsLiveStateEvent($sessionId: ID!) {
    //     callParticipantsReactionsLiveStateEvent(sessionId: $sessionId) {
    //       sessionId
    //       meetingReactions {
    //         participantId
    //         meetingReaction
    //       }
    //     }
    //   }
  };
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
      {props.reactions.raiseHand && (
        <ControlBarButton
          onClick={onReaction('Raise hand', user)}
          strings={{ label: 'Raise Hand' }}
          styles={styles}
          onRenderOffIcon={onRenderRaiseHandIcon}
        ></ControlBarButton>
      )}
      {props.reactions.clap && (
        <ControlBarButton
          onClick={onReaction('Clap', user)}
          strings={{ label: 'clap' }}
          styles={styles}
          onRenderOffIcon={onRenderClapIcon}
        ></ControlBarButton>
      )}
      {props.reactions.wow && (
        <ControlBarButton
          onClick={onReaction('Suprised', user)}
          strings={{ label: 'wow' }}
          styles={styles}
          onRenderOffIcon={onRenderWowIcon}
        ></ControlBarButton>
      )}
      {props.reactions.heart && (
        <ControlBarButton
          onClick={onReaction('Heart', user)}
          strings={{ label: 'heart' }}
          styles={styles}
          onRenderOffIcon={onRenderHeartIcon}
        ></ControlBarButton>
      )}
      {props.reactions.laugh && (
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
