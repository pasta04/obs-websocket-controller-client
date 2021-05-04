import { Button, IconButton, MenuItem, Paper, Select, Tooltip, Hidden, TextField } from '@material-ui/core';
import { createStyles, makeStyles, Theme, ThemeProvider } from '@material-ui/core/styles';
import React, { useReducer, useRef, useState } from 'react';
import { ArrayItem, OBSCommand, Scene } from '../../../types/global';
import Modal from '../../molecules/Modal';
import Snackbar from '../../molecules/SnackBar';
import * as actions from '../../../actions';
import reducer, { initialState } from '../../../reducers';
import * as util from '../../../util';
import { getType } from 'typesafe-actions';
import { Mic, MicOff, Settings, SettingsVoiceTwoTone, ViewArray } from '@material-ui/icons';
import useInterval from 'use-interval';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    },
    header: {
      position: 'sticky',
      background: 'black',
      top: '0px',
      zIndex: 1,
      padding: '5px',
    },
    headerInner: {
      background: 'black',
      color: 'white',
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      width: '100vw',
      zIndex: 1,
      justifyContent: 'center',
    },
    footerInner: {
      padding: 5,
    },
    content: {
      padding: 2,
      width: 'calc(100% - 4px)',
      display: 'block',
      height: '100%',
    },
    button: {
      margin: 5,
      whiteSpace: 'nowrap',
    },
    img: {
      width: '100%',
      height: 'auto',
      maxWidth: '100%',
    },
    buttonLabel: {
      fontSize: 'small',
    },
    connectionLabel: {
      color: 'white',
      width: 60,
      margin: 2,
      textAlign: 'center',
      fontSize: 'small',
      height: 25,
    },
  }),
);

const App: React.FC = () => {
  const classes = useStyles({});

  const [state, dispatch] = useReducer(reducer, initialState);
  const [micMute, setMicMute] = useState(false);
  const [sceneList, setSceneList] = useState<Scene[]>([]);
  const [obsImage, setObsImage] = useState('');
  const [viewType, setViewType] = useState(false);
  const [setting, setSetting] = useState(false);

  const obsUrlRef = useRef<HTMLInputElement>();
  const managerUrlRef = useRef<HTMLInputElement>();
  const iconsizeRef = useRef<HTMLInputElement>();
  const micsrcRef = useRef<HTMLInputElement>();

  React.useEffect(() => {
    console.log('init - start');
    const load = util.storage.loadStorage();
    if (load.config) dispatch({ type: getType(actions.storeConfig), payload: load.config });
    if (load.data) dispatch({ type: getType(actions.updateCommandList), payload: load.data });

    // OBSと接続
    if (load.config?.obswsUrl) {
      startObs(load.config.obswsUrl);
    }

    // Managerと接続
    if (load.config?.managerwsUrl) {
      util.manager.init(load.config.managerwsUrl);
    }

    console.log('init - done');
  }, []);

  const startObs = (url: string, pass?: string) => {
    const obs = util.obs.init(url, pass);
    obs.on('ConnectionOpened', (data) => {
      dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: true, connectionInfo: 'ok' } });
    });
    obs.on('ConnectionClosed', (data) => {
      console.log(data);
      dispatch({ type: getType(actions.updateObsConnectionStatus), payload: { connection: false, connectionInfo: 'ng' } });
      util.obs.init(url, pass);
    });
    obs.on('ScenesChanged', (data) => {
      // state.
      console.log(data);
    });
    obs.on('Heartbeat', (data) => {
      dispatch({ type: getType(actions.updateObsHeatbeat), payload: data });
    });
  };

  useInterval(async () => {
    if (!window.obsWs || !state.obs.connection) return;
    const res = await window.obsWs.send('TakeSourceScreenshot', {
      embedPictureFormat: 'png',
      height: 540,
      sourceName: state.obsStatus['current-scene'] as string,
    });
    setObsImage(res.img);
  }, 500);

  useInterval(async () => {
    if (!window.obsWs || !state.obs.connection) return;
    const res = await window.obsWs.send('GetSceneList');
    setSceneList(res.scenes);
  }, 4000);

  useInterval(async () => {
    if (!window.obsWs || !state.obs.connection) return;
    const res = await window.obsWs.send('GetMute', {
      source: state.config.micSrcName,
    });
    setMicMute(res.muted);
  }, 500);

  const exeButton = (id: string) => {
    console.log(`exeButton: ${id}`);
    const item = state.data.find((data) => data.id === id);
    if (!item) return;
    util.exe.execAction(item);
  };

  const exeSceneChangeButton = (name: string) => {
    console.log(`exeSceneChangeButton: ${name}`);
    const command: OBSCommand = {
      target: 'obsws',
      type: 'changeScene',
      data: name,
    };
    util.exe.exeObsCommand(command);
  };

  const createData = (data: ArrayItem<typeof state.data>) => {
    return (
      <Button key={data.id} onClick={() => exeButton(data.id)} style={{ width: 64, height: 64 }}>
        <img className={classes.img} src={data.icon} />
        <div className={classes.buttonLabel}>{data.title}</div>
      </Button>
    );
  };

  const createSceneData = (data: Scene) => {
    return (
      <Button key={data.name} className={classes.button} onClick={() => exeSceneChangeButton(data.name)} variant={'contained'}>
        <div className={classes.buttonLabel}>{data.name}</div>
      </Button>
    );
  };

  const openSetting = () => {
    console.log('openSetting');
    setSetting(!setting);
  };
  const toggleView = () => {
    setViewType(!viewType);
    setSetting(false);
  };

  const obsBasedView = () => {
    return (
      <>
        <div>{sceneList.map(createSceneData)}</div>
      </>
    );
  };

  const commandView = () => {
    return (
      <>
        <div>{state.data.map(createData)}</div>
      </>
    );
  };

  const applyConfig = () => {
    const obswsUrl = obsUrlRef.current?.value ?? '';
    const managerwsUrl = managerUrlRef.current?.value ?? '';
    const iconSize = Number(iconsizeRef.current?.value ?? 32);
    const micSrcName = micsrcRef.current?.value ?? '';
    util.storage.saveLocalStorageConfig({
      ...state.config,
      obswsUrl,
      managerwsUrl,
      iconSize,
      micSrcName,
    });

    window.location.reload();
  };

  const settingsView = () => {
    return (
      <>
        <div style={{ display: 'block', padding: 10, textAlign: 'center' }}>
          <div>
            <TextField style={{ width: 250 }} placeholder={'OBS WebSocketのIP:Port'} defaultValue={state.config.obswsUrl} inputRef={obsUrlRef} />
          </div>
          <div>
            <TextField style={{ width: 250 }} placeholder={'Command ManagerのIP:Port'} defaultValue={state.config.managerwsUrl} inputRef={managerUrlRef} />
          </div>
          <div>
            <TextField style={{ width: 250 }} placeholder={'Iconの表示サイズ'} defaultValue={state.config.iconSize} inputRef={iconsizeRef} />
          </div>
          <div>
            <TextField style={{ width: 250 }} placeholder={'マイクのソース名'} defaultValue={state.config.micSrcName} inputRef={micsrcRef} />
          </div>
          <div style={{ padding: 10 }}>
            <Button variant={'contained'} onClick={applyConfig}>
              適用
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="SW-update-dialog"></div>
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerInner} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={classes.connectionLabel} style={{ backgroundColor: state.obs.connection ? 'green' : 'red' }}>
              OBS
            </div>
            <div className={classes.connectionLabel} style={{ backgroundColor: state.manager.connection ? 'green' : 'red' }}>
              Manager
            </div>
            {micMute ? <MicOff /> : <Mic />}
            <div style={{ fontSize: 1 }}>
              <div style={{ border: 'solid 1px #fff', paddingLeft: 5, paddingRight: 5 }}>FPS: {state.obsStatus.stats.fps.toPrecision(4)}</div>
              <div style={{ border: 'solid 1px #fff', paddingLeft: 5, paddingRight: 5 }}>Render-Avg: {state.obsStatus.stats['average-frame-time'].toPrecision(3)}ms</div>
            </div>
            <div className={classes.headerInner} style={{ display: 'flex', position: 'absolute', right: 0 }}>
              <IconButton onClick={toggleView} style={{ color: 'white', marginRight: 10 }} size={'small'}>
                <ViewArray />
              </IconButton>

              <IconButton onClick={openSetting} style={{ color: 'white' }} size={'small'}>
                <Settings />
              </IconButton>
            </div>
          </div>
        </div>
        <div className={classes.content}>{setting ? settingsView() : viewType ? commandView() : obsBasedView()}</div>
        {!state.config.obswsUrl && 'まずは右上のアイコンから設定してね'}
        <div className={classes.footer}>
          <div className={classes.footerInner}>
            <div style={{ width: '30vw', float: 'right' }}>
              <img className={classes.img} src={obsImage} />
            </div>
          </div>
        </div>
      </div>

      {/* 通知系 */}
      <Snackbar
        open={state.notify.show}
        message={state.notify.message}
        variant={state.notify.type}
        closable={state.notify.closable}
        onClose={() => dispatch({ type: getType(actions.closeNotify) })}
      />
    </div>
  );
};

export default App;
