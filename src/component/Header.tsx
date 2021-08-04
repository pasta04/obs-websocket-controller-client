import React, { useReducer, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, Vibration } from 'react-native';
import { Box, Button, Container, Icon } from 'native-base';
import * as util from '../util';
import reducer, { initialState } from '../reducers';
import * as actions from '../actions';
import { Scene } from 'obs-websocket-js';
import { getType } from 'typesafe-actions';
import useInterval from 'use-interval';
import { GlobalState, OBSCommand } from '../global';
import { execAction } from '../util/exeCommand';
import { sleep } from '../util/common';
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
    init();
  }, []);

  // React.useEffect(() => {
  //   if (!isConnectedObs) obsConnect();
  // }, [JSON.stringify(props.config.obswsUrl)]);

  const init = async () => {
    // OBSと接続
    initObs();
    // connection();
  };

  const obsConnect = () => {
    if (props.config.obswsUrl) {
      util.obs.startConnect(props.config.obswsUrl);
      // startObs('192.168.100.100:4444');
    } else {
      console.log(`OBSのURLが未指定 obswsUrl = ${props.config.obswsUrl}`);
    }
  };

  const mngConnect = () => {
    if (props.config?.managerwsUrl) {
      util.manager.init(props.config.managerwsUrl);
    } else {
      console.log(`OBSのURLが未指定 obswsUrl = ${props.config.obswsUrl}`);
    }
  };

  React.useEffect(() => {
    console.log('configが変わった');
    const id = new Date().getTime().toString();
    util.storage.saveAny('id', id);
    checkObsConnection(id);
  }, [JSON.stringify(props.config)]);

  const checkObsConnection = async (id: string) => {
    console.log(`checkObsConnection ${id}`);
    const nowId = await util.storage.loadAny('id');
    if (id !== nowId) return;

    try {
      if (!window.obsWs) throw new Error('まだナイヨ');

      if ((await util.storage.loadAny('obsconnect')) !== '1') {
        obsConnect();
      } else {
        const result = await window.obsWs.send('GetSceneList');
        if (result.status === 'ok') {
          util.storage.saveAny('sceneList', JSON.stringify(result.scenes));
        }
      }
    } catch (e) {
      //
    }

    await sleep(1000);

    checkObsConnection(id);
  };

  const checkMngConnection = async (id: string) => {
    console.log(`checkMngConnection ${id}`);
    const nowId = await util.storage.loadAny('id');
    if (id !== nowId) return;

    try {
      if (!window.managerWs) throw new Error('まだナイヨ');

      if ((await util.storage.loadAny('mngconnect')) !== '1') {
        mngConnect();
      }
    } catch (e) {
      //
    }

    await sleep(1000);

    checkMngConnection(id);
  };

  const initObs = async () => {
    console.log('startObs');
    try {
      const obs = util.obs.init();
      util.storage.saveAny('obsconnect', '0');
      console.log('成功');

      obs.on('ConnectionOpened', (data) => {
        obs.send('SetHeartbeat', { enable: true });
        dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: true, connectionInfo: 'ok' } });
        util.storage.saveAny('obsconnect', '1');
      });
      obs.on('ConnectionClosed', (data) => {
        console.log('obs - ConnectionClosed');
        console.log(data);
        dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: false, connectionInfo: 'ng' } });
        util.storage.saveAny('obsconnect', '0');
      });
      obs.on('ScenesChanged', (data) => {
        console.log('obs - ScenesChanged');
        console.log(data);
      });
      obs.on('Heartbeat', (data) => {
        dispatch({ type: getType(actions.updateObsHeatbeat), payload: data });
      });
    } catch (e) {
      console.error(e);
      // await sleep(1000);
      // startObs(url, pass);
    }
  };

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
