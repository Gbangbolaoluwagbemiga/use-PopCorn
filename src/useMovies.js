import {useEffect, useState} from 'react';
const apiKey = `2834ffac`;

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(
    function () {
      callback?.();
      const controller = new AbortController();
      setIsLoading(false);
      async function fetchMovies() {
        try {
          setError('');
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&s=${query} `,
            {signal: controller.signal}
          );
          if (!res.ok) throw new Error(`something went wrong`);

          const data = await res.json();
          if (data.Response === 'False') throw new Error(`No movies found`);

          setMovies(data.Search);
          setError('');
        } catch (err) {
          if (err.name === 'AbortError') return;
          setError(err.message);
        } finally {
          setIsLoading(true);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError('');
        return;
      }

      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return {movies, isLoading, error};
}
