import { GlobalState, OBSCommand, PCCommand } from '../global';

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
      window.obsWs.send('SetCurrentScene', {
        'scene-name': command.data, // シーン名
      });
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
        source: command.data, // 音声ソース名
      });
      break;
    }
  }
};

const exePcCommand = (command: PCCommand) => {
  if (!window.managerWs) return;
  window.managerWs.send(
    JSON.stringify({
      type: 'exec',
      id: command.data,
    })
  );
};
