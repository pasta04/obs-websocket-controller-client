import React, { useReducer, useState } from 'react';
import { Container } from 'native-base';

import reducer, { initialState } from '../reducers';
import { Scene } from 'obs-websocket-js';
import useInterval from 'use-interval';
import IconView from './IconView';
import SceneView from './SceneView';
import Setting from './Setting';
import Header from './Header';
import * as util from '../util';

const Layout = () => {
  const [itemList, setItemList] = useState<{ uri: string; id: string }[]>([
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '1',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '2',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '3',
    },
    {
      uri: 'https://mypage.aikatsu.com/images/logo.png',
      id: '4',
    },
  ]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const [config, setConfig] = useState(initialState.config);
  const [sceneList, setSceneList] = useState<Scene[]>([]);
  const [obsImage, setObsImage] = useState('');
  const [viewType, setViewType] = useState(false);
  const [setting, setSetting] = useState(false);

  const toggleSetting = () => {
    console.log('openSetting');
    setSetting(!setting);
  };

  const toggleView = () => {
    if (setting) {
      setViewType(viewType);
      setSetting(false);
    } else {
      setViewType(!viewType);
      setSetting(false);
    }
  };

  React.useEffect(() => {
    console.log('Home config変更');
  }, [JSON.stringify(state.config)]);

  useInterval(async () => {
    const load = await util.storage.loadStorage();
    if (JSON.stringify(load.config) !== JSON.stringify(config)) setConfig(load.config);

    const sceneListtmp = await util.storage.loadAny('sceneList');
    if (!sceneListtmp) return;
    const ressceneList = JSON.parse(sceneListtmp) as Scene[];
    const resNameList = ressceneList.map((item) => item.name);
    const orgNameList = sceneList.map((item) => item.name);
    if (JSON.stringify(resNameList) !== JSON.stringify(orgNameList)) {
      console.log(resNameList);
      console.log(orgNameList);

      console.log('Scene更新');
      setSceneList(ressceneList);
    }
  }, 500);

  // useInterval(async () => {
  //   if (!window.obsWs || !state.obs.connection) return;
  //   const res = await window.obsWs.send('GetSceneList');
  //   setSceneList(res.scenes);
  // }, 4000);

  const viewList = () => {
    if (setting) {
      return <Setting {...config} />;
    }
    if (viewType) {
      return <SceneView config={config} sceneList={sceneList} />;
    }
    return <IconView itemList={itemList} img={obsImage} config={config} />;
  };

  return (
    <Container width={'100%'} maxWidth={'100%'}>
      <Header toggleSetting={toggleSetting} toggleView={toggleView} config={config} />

      {viewList()}
    </Container>
  );
};

export default Layout;
