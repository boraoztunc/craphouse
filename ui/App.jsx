import React, { useMemo } from 'react';
import { render } from 'react-dom';
import { usePath } from './lib/use-location';
import Jam from './Jam';
import { parseUrlConfig } from './lib/url-utils';

render(<App />, document.querySelector('#root'));

function App() {
  const [route = null] = usePath();
  const dynamicConfig = useMemo(parseUrlConfig, [route]);

  return (
    <Jam
      style={{ height: '100vh' }}
      route={route}
      dynamicConfig={dynamicConfig}
    />
  );
}
