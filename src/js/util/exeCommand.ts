import { GlobalState, OBSCommand, PCCommand } from '../types/global';

export function execAction(item: GlobalState['data'][0]) {
  for (const command of item.command) {
    console.log(JSON.stringify(command, null, '  '));

    if (command.target === 'obsws') {
      exeObsCommand(command);
    } else {
      exePcCommand(command);
    }
  }
}

export const exeObsCommand = (command: OBSCommand) => {
  // obsとの接続確認
  if (!window.obsWs) {
    return;
  }

  switch (command.type) {
    case 'changeScene': {
      const item = {
        'scene-name': command.data,
      };
      window.obsWs.send('SetCurrentScene', item);
      break;
    }
    case 'startStream': {
      window.obsWs.send('StartStreaming', {});
      break;
    }
    case 'stopStream': {
      window.obsWs.send('StopStreaming');
      break;
    }
    case 'startRecording': {
      window.obsWs.send('StartRecording');
      break;
    }
    case 'stopRecording': {
      window.obsWs.send('StopRecording');
      break;
    }
    case 'toggleMute': {
      window.obsWs.send('ToggleMute', {
        source: command.data,
      });
      break;
    }
  }
};

const exePcCommand = (command: PCCommand) => {
  console.warn('未実装');
  window.managerWs.send(
    JSON.stringify({
      type: 'exec',
      id: command.data,
    }),
  );
};
