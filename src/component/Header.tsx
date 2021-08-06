import React, { useReducer, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, Vibration } from 'react-native';
import { Box, Button, Container, Icon } from 'native-base';
import * as util from '../util';
import reducer, { initialState } from '../reducers';
import * as actions from '../actions';
import { getType } from 'typesafe-actions';
import useInterval from 'use-interval';
import { GlobalState, OBSCommand } from '../global';
import { execAction } from '../util/exeCommand';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'black',
    padding: 0,
    height: 60,
    width: '100%',
  },
  connectionStatusOk: {
    height: 40,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  connectionStatusNg: {
    height: 40,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  text: {
    color: 'white',
  },
});

const OBS_IMG_WIDTH = Dimensions.get('window').width * 0.2;
const OBS_IMG_HEIGHT = 50;

type PropType = {
  toggleSetting: () => void;
  toggleView: () => void;
  config: GlobalState['config'];
};

const Layout = (props: PropType) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [micMute, setMicMute] = useState(false);
  const [obsImage, setObsImage] = useState('');

  React.useEffect(() => {
    util.obs.default.on('open', () => {
      console.log('obs - connected');
      dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: true, connectionInfo: 'ok' } });
    });
    util.obs.default.on('close', (reason) => {
      console.log('obs - disconnected');
      dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: false, connectionInfo: reason } });
    });
    util.obs.default.on('error', (error) => {
      // 特に通知することは無い
    });
    util.obs.default.ws.on('ScenesChanged', (data) => {
      console.log('obs - ScenesChanged');
      console.log(data);
    });
    util.obs.default.ws.on('Heartbeat', (data) => {
      dispatch({ type: getType(actions.updateObsHeatbeat), payload: data });
    });

    util.manager.default.on('open', () => {
      console.log('manager - connected');
      dispatch({ type: getType(actions.updateManagerConnectionStatus), payload: { connection: true, connectionInfo: 'ok' } });
    });
    util.manager.default.on('close', (reason) => {
      console.log('manager - disconnected');
      dispatch({ type: getType(actions.updateManagerConnectionStatus), payload: { connection: false, connectionInfo: reason } });
    });
  }, []);

  // URLが変わったら再接続する
  React.useEffect(() => {
    if (props.config.obswsUrl) {
      util.obs.default.init(props.config.obswsUrl);
      util.obs.default.start();
    }
  }, [props.config.obswsUrl]);

  React.useEffect(() => {
    if (props.config.managerwsUrl) {
      util.manager.default.init(props.config.managerwsUrl);
      util.manager.default.start();
    }
  }, [props.config.managerwsUrl]);

  // OBSで配信中の画像
  useInterval(async () => {
    if (!window.obsWs || !state.obs.connection) return;
    const res = await window.obsWs.send('TakeSourceScreenshot', {
      embedPictureFormat: 'png',
      height: 540,
      sourceName: state.obsStatus['current-scene'] as string,
    });
    setObsImage(res.img);
  }, 2000);

  useInterval(async () => {
    if (!window.obsWs || !state.obs.connection) return;
    const result = await window.obsWs.send('GetSceneList');
    if (result.status === 'ok') {
      util.storage.saveAny('sceneList', JSON.stringify(result.scenes));
    }
  }, 1000);

  // マイクミュート状況の取得
  useInterval(async () => {
    getMicMute();
  }, 500);

  const getMicMute = async () => {
    if (!window.obsWs || !state.obs.connection) return;
    try {
      const res = await window.obsWs.send('GetMute', {
        source: state.config.micSrcName,
      });
      setMicMute(res.muted);
    } catch (e) {
      console.log(e);
    }
  };

  /** マイクミュート切り替え */
  const toggleMute = () => {
    const command: OBSCommand = {
      target: 'obsws',
      type: 'toggleMute',
      data: state.config.micSrcName,
    };
    Vibration.vibrate(0.2 * 1000);
    execAction({ command: [command], id: '', icon: '', title: '' });

    getMicMute();
  };

  return (
    <Container width={'100%'} maxWidth={'100%'}>
      <Box display={'flex'} flexDirection={'row'} padding={1} width={'100%'} maxWidth={'100%'}>
        <View style={state.obs.connection ? styles.connectionStatusOk : styles.connectionStatusNg}>
          <Text style={styles.text}>OBS</Text>
        </View>
        <View style={{ marginLeft: 5 }} />
        <View style={state.manager.connection ? styles.connectionStatusOk : styles.connectionStatusNg}>
          <Text style={styles.text}>Manager</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <View style={{ borderWidth: 1, borderColor: '#fff', paddingLeft: 5, paddingRight: 5 }}>
            <Text style={styles.text}>FPS: {state.obsStatus.stats.fps.toPrecision(4)}</Text>
          </View>
          <View style={{ borderWidth: 1, borderColor: '#fff', paddingLeft: 5, paddingRight: 5 }}>
            <Text style={styles.text}>Render-Avg: {state.obsStatus.stats['average-frame-time'].toPrecision(3)}ms</Text>
          </View>
        </View>
        <View style={{ marginLeft: 10 }}>
          <Button
            display={'flex'}
            onPress={toggleMute}
            variant={'solid'}
            backgroundColor={'#888'}
            height={45}
            startIcon={<Icon as={MaterialCommunityIcons} name={micMute ? 'microphone-off' : 'microphone'} color={micMute ? 'red' : 'white'} />}
          ></Button>
        </View>

        {obsImage ? (
          <View>
            <Image source={{ uri: obsImage }} style={{ width: OBS_IMG_WIDTH, height: OBS_IMG_HEIGHT }} resizeMode="contain" fadeDuration={0} />
          </View>
        ) : undefined}

        <Box display={'flex'} flexDirection={'row-reverse'} right={0} position={'absolute'}>
          <Button variant={'ghost'} onPress={props.toggleSetting}>
            <Icon as={MaterialCommunityIcons} name="cog" color={'white'} />
          </Button>
          <Button variant={'ghost'} onPress={props.toggleView}>
            <Icon as={MaterialCommunityIcons} name={'layers'} color={'white'} />
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Layout;
