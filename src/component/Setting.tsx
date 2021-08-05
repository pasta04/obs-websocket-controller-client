import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Container, Box, Button, Input, View } from 'native-base';
import * as util from '../util';
import { GlobalState } from '../global';
import { sleep } from '../util/common';

const Layout = (stateConfig: GlobalState['config']) => {
  const [obswsUrl, setObsUrl] = React.useState(stateConfig.obswsUrl);
  const [managerwsUrl, setmanagerwsUrl] = React.useState(stateConfig.managerwsUrl);
  const [iconSize, seticonSize] = React.useState(stateConfig.iconSize ?? 80);
  const [micSrcName, setmicSrcName] = React.useState(stateConfig.micSrcName);

  React.useEffect(() => {
    setObsUrl(stateConfig.obswsUrl);
    setmanagerwsUrl(stateConfig.managerwsUrl);
    seticonSize(stateConfig.iconSize);
    setmicSrcName(stateConfig.micSrcName);
  }, [JSON.stringify(stateConfig)]);

  const applyConfig = () => {
    console.log('applyConfig');
    const newConfig = createNewConfig();
    console.log(newConfig);

    util.obs.default.stop();
    util.obs.default.init(newConfig.obswsUrl);
    util.obs.default.start();

    util.manager.default.stop();
    util.manager.default.init(newConfig.managerwsUrl);
    util.manager.default.start();

    util.storage.saveLocalStorageConfig(newConfig);
  };
  const createNewConfig = () => {
    return {
      ...stateConfig,
      obswsUrl,
      managerwsUrl,
      iconSize,
      micSrcName,
    };
  };

  const isSameConfig = () => JSON.stringify(stateConfig) === JSON.stringify(createNewConfig());

  return (
    <Container width={'100%'} maxWidth={'100%'} alignItems={'center'}>
      <Box alignContent={'center'} alignItems={'center'} maxWidth={'100%'} height={600}>
        <Box display={'flex'} flexDirection={'row'}>
          <Box>
            <Text style={styles.text}>OBS WebSocket URL</Text>
            <Input variant="outline" backgroundColor={'white'} value={obswsUrl} onChangeText={(text) => setObsUrl(text)} width={300} />
          </Box>

          <Box margin={4} />

          <Box>
            <Text style={styles.text}>Manager URL</Text>
            <Input variant="outline" backgroundColor={'white'} value={managerwsUrl} onChangeText={(text) => setmanagerwsUrl(text)} width={300} />
          </Box>
        </Box>

        <Box display={'flex'} flexDirection={'row'}>
          <Box>
            <Text style={styles.text}>アイコンサイズ</Text>
            <Input variant="outline" backgroundColor={'white'} defaultValue={iconSize.toString()} onChangeText={(text) => seticonSize(Number(text))} width={300} />
          </Box>
          <Box margin={4} />
          <Box>
            <Text style={styles.text}>音声ソース マイク名</Text>
            <Input variant="outline" backgroundColor={'white'} value={micSrcName} onChangeText={(text) => setmicSrcName(text)} width={300} />
          </Box>
        </Box>

        <View style={{ marginTop: 10 }}></View>

        <Button onPress={applyConfig} disabled={isSameConfig()}>
          <Text style={styles.text}>適用</Text>
        </Button>
      </Box>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'black',
    padding: 0,
    height: 40,
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

export default Layout;
