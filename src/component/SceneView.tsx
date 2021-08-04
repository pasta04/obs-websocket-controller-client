import React, { useReducer, useState } from 'react';
import { StyleSheet, View, Dimensions, FlatList, Vibration } from 'react-native';
import { Container, Box, Button, Text } from 'native-base';
import ImageButton from './ImageButton';
import * as util from '../util';
import reducer, { initialState } from '../reducers';
import { ArrayItem, GlobalState, OBSCommand, Scene } from '../global';
import useInterval from 'use-interval';

type ComponentTypes = {
  config: GlobalState['config'];
  sceneList: Scene[];
};
const ONE_SECOND_IN_MS = 1000;

type PropType = ComponentTypes;

const Layout = (props: PropType) => {
  const [itemList, setItemList] = useState<Scene[]>([]);

  React.useEffect(() => {
    console.log(props.sceneList);
    setItemList(props.sceneList);
  }, [JSON.stringify(props.sceneList)]);

  const exeButton = (sceneName: string) => {
    window.obsWs.send('SetCurrentScene', {
      'scene-name': sceneName,
    });
    Vibration.vibrate(0.3 * ONE_SECOND_IN_MS);
  };

  return (
    <Container>
      <Box>
        <View style={{ padding: 10 }}>
          <FlatList
            key={JSON.stringify(props.sceneList)}
            data={itemList}
            keyExtractor={(item, index) => index.toString()}
            numColumns={4}
            renderItem={({ item }) => (
              <Box margin={2}>
                <Button onPress={() => exeButton(item.name)} backgroundColor={'white'}>
                  <Text>{item.name}</Text>
                </Button>
              </Box>
            )}
          />
        </View>
      </Box>
    </Container>
  );
};

export default Layout;
