import React from 'react';
import { Image } from 'react-native';
import { Button } from 'native-base';

type Props = {
  uri: string;
  iconSize: number;
  onPress: () => void;
};

const Layout = (props: Props) => {
  return (
    <Button style={{ margin: 10, width: props.iconSize, height: props.iconSize, backgroundColor: 'lightgray', borderRadius: 2 }} onPress={props.onPress}>
      <Image source={{ uri: props.uri }} style={{ width: props.iconSize - 2, height: props.iconSize - 2 }} />
    </Button>
  );
};

export default Layout;
