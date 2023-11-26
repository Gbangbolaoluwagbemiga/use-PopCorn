import {useEffect, useState} from 'react';

export function useLocalStorage() {
  const [watched, setWatchMovies] = useState(function () {
    const storedWatched = localStorage.getItem('watched');
    return JSON.parse(storedWatched);
  });

  useEffect(
    function () {
      localStorage.setItem('watched', JSON.stringify(watched));
    },
    [watched]
  );

  return {watched};
}
