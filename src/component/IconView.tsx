import React, { useReducer, useState } from 'react';
import { View, Dimensions, FlatList, Vibration } from 'react-native';
import { Container, Box } from 'native-base';
import ImageButton from './ImageButton';
import * as util from '../util';
import reducer, { initialState } from '../reducers';
import { GlobalState } from '../global';
import { getType } from 'typesafe-actions';
import * as actions from '../actions';

type ComponentTypes = {
  itemList: { uri: string; id: string }[];
  config: GlobalState['config'];
};
const ONE_SECOND_IN_MS = 1000;

type PropType = ComponentTypes;

const Layout = (props: PropType) => {
  console.log(props.config);

  const [itemList, setItemList] = useState<{ uri: string; id: string }[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const [iconSize, setIconSize] = useState(props.config.iconSize);
  const [colNum, setColNum] = useState(Math.floor(Dimensions.get('window').width / (25 + iconSize)));

  React.useEffect(() => {
    setColNum(Math.floor(Dimensions.get('window').width / (25 + iconSize)));
  }, [props.config.iconSize.toString()]);

  React.useEffect(() => {
    util.manager.default.on('data', (data) => {
      dispatch({ type: getType(actions.updateCommandList), payload: data });
    });
  }, []);

  React.useEffect(() => {
    // 引数が変わった
    setItemList(props.itemList);
    // console.log(props.img);
  }, [JSON.stringify(props.itemList)]);

  /** タップしたら振動 */
  const onPressButton = (id: string) => {
    console.log(`exeButton: ${id}`);
    vibe();
    const item = state.data.find((data) => data.id === id);
    if (!item) return;
    util.exe.execAction(item);
  };

  const vibe = async () => {
    Vibration.vibrate(0.3 * ONE_SECOND_IN_MS);
  };

  return (
    <Container width={'100%'} maxWidth={'100%'}>
      <Box marginBottom={iconSize} width={'100%'} maxWidth={'100%'}>
        <View style={{ padding: 10 }}>
          <FlatList
            key={`${colNum}_${iconSize}`}
            data={itemList}
            keyExtractor={(item, index) => index.toString()}
            numColumns={colNum}
            renderItem={({ item }) => (
              <View>
                <ImageButton uri={item.uri} iconSize={iconSize} onPress={() => onPressButton(item.id)} />
              </View>
            )}
          />
        </View>
      </Box>
    </Container>
  );
};

export default Layout;
