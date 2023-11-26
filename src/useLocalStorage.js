import {useEffect, useState} from 'react';

export function useLocalStorage(initialState, key) {
  const [watched, setWatchMovies] = useState(function () {
    const storedWatched = localStorage.getItem(key);
    return storedWatched ? JSON.parse(storedWatched) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(watched));
    },
    [watched, key]
  );

  return [watched, setWatchMovies];
}
