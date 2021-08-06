import React, { useReducer, useState } from 'react';
import { View, Dimensions, FlatList, Vibration } from 'react-native';
import { Container, Box } from 'native-base';
import ImageButton from './ImageButton';
import * as util from '../util';
import reducer, { initialState } from '../reducers';
import { ControllData, GlobalState } from '../global';
import { getType } from 'typesafe-actions';
import * as actions from '../actions';

type ComponentTypes = {
  config: GlobalState['config'];
};

type PropType = ComponentTypes;

const Layout = (props: PropType) => {
  console.log(props.config);

  const [itemList, setItemList] = useState<{ uri: string; id: string }[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const [iconSize, setIconSize] = useState(props.config.iconSize);
  const [colNum, setColNum] = useState(Math.floor(Dimensions.get('window').width / (25 + iconSize)));

  React.useEffect(() => {
    // localstorageからデータ読み込み
    init();

    util.manager.default.on('data', (data) => {
      dispatch({ type: getType(actions.updateCommandList), payload: data });
      util.storage.saveLocalStorageCommand(data);
    });
  }, []);

  const init = async () => {
    const result = await util.storage.loadStorage();
    const data: GlobalState['data'] = result.data;

    if (data) {
      dispatch({ type: getType(actions.updateCommandList), payload: data });
      const itemList = data.map((item) => {
        return { uri: item.icon, id: item.id };
      });
      setItemList(itemList);
    }
  };

  React.useEffect(() => {
    setColNum(Math.floor(Dimensions.get('window').width / (25 + iconSize)));
    setIconSize(props.config.iconSize);
  }, [props.config.iconSize.toString()]);

  /** タップしたら振動 */
  const onPressButton = (id: string) => {
    console.log(`exeButton: ${id}`);
    const item = state.data.find((data) => data.id === id);
    let isExecutable = true;

    if (!item) {
      console.warn(`コマンド実行対象が見つからない id=${id}`);
      isExecutable = false;
    }

    const isPcCommand = !!item?.command.find((a) => a.target === 'pc');
    const isObsCommand = !!item?.command.find((a) => a.target === 'obsws');

    if (isObsCommand && !state.obs.connection) {
      console.warn(`OBSに繋がってない`);
      isExecutable = false;
    }

    if (isPcCommand && !state.manager.connection) {
      console.warn(`Managerに繋がってない`);
      isExecutable = false;
    }

    if (isExecutable) {
      util.common.vibe();
      util.exe.execAction(item as ControllData);
    } else {
      util.common.longvibe();
      // TODO: 実行できない通知
    }
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
            renderItem={({ item, index }) => (
              <View key={`${iconSize}_${index}`}>
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
