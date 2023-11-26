import {useEffect} from 'react';

export function useKey(key, action) {
  useEffect(
    function () {
      function eventCleanUP(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      document.addEventListener('keydown', eventCleanUP);
      return function () {
        document.removeEventListener('keydown', eventCleanUP);
      };
    },
    [action, key]
  );
}
