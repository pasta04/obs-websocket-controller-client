import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Container, Box, Button, Text } from 'native-base';
import * as util from '../util';
import { GlobalState, Scene } from '../global';

type ComponentTypes = {
  config: GlobalState['config'];
  sceneList: Scene[];
};
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
    util.common.vibe();
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
