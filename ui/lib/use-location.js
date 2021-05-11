import {useEffect} from 'react';
import {update, use} from 'use-minimal-state';

let atom = [];
let updater = () => update(atom);

export function useLocation() {
  use(atom);
  useEffect(() => {
    window.addEventListener('popstate', updater);
    return () => window.removeEventListener('popstate', updater);
  }, []);
  return location;
}

export function usePath() {
  return useLocation()
    .pathname.split('/')
    .filter(p => p);
}

export function navigate(route) {
  history.pushState(null, '', route);
  update(atom);
}
