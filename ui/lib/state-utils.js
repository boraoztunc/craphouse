import {useEffect} from 'react';
import {is, on} from 'use-minimal-state';
import log from '../lib/causal-log';

export {until, useSync, debug};

async function until(state, key, condition) {
  let value = state[key];
  if (condition ? condition(value) : value) {
    return value;
  } else {
    return new Promise(resolve => {
      let off = on(state, key, value => {
        if (condition ? condition(value) : value) {
          off();
          resolve(value);
        }
      });
    });
  }
}

async function useSync(...args) {
  let deps = args.pop();
  useEffect(() => {
    is(...args);
  }, deps);
}

function debug(state) {
  on(state, (key, value, oldValue) => {
    if (oldValue !== undefined) {
      log(key, oldValue, '->', value);
    } else {
      log(key, value);
    }
  });
}
