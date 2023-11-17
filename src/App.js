import {useEffect, useState} from 'react';
import StarRating from './starRating';

const tempMovieData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  },
];

const tempWatchedData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: 'tt0088763',
    Title: 'Back to the Future',
    Year: '1985',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];
const apiKey = `2834ffac`;

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatchMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  function handleMovieId(id) {
    setSelectedId(selectedId => (id === selectedId ? null : id));
  }
  function handleRemoveId() {
    setSelectedId(null);
  }

  function handleAddWatch(newMovies) {
    setWatchMovies(prev => [...prev, newMovies]);
  }

  function handleDeleteWatched(id) {
    setWatchMovies(watched => watched.filter(movie => movie.imdbID !== id));
  }

  useEffect(
    function () {
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

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Result movies={movies} />
      </NavBar>
      <Main>
        {/* The list of movie */}
        <Box>
          {/* {!isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {!isLoading && <Loader />}
          {isLoading && !error && (
            <MovieList movies={movies} onselected={handleMovieId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        {/* The list of watched movie */}
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onRemoveId={handleRemoveId}
              onAddWatch={handleAddWatch}
              watched={watched}
              setError={setError}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovie
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}{' '}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">LOADING...</p>;
}

function ErrorMessage({message}) {
  return <p className="error">{message}</p>;
}

function NavBar({children}) {
  return <nav className="nav-bar">{children}</nav>;
}

function Main({children}) {
  return <main className="main">{children}</main>;
}

const average = arr =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query, setQuery}) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  );
}

function Result({movies}) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// End of Navbar component

// Main Component started

function MovieList({movies, onselected}) {
  return (
    <ul className="list list-movies">
      {movies?.map(movie => (
        <Movie movie={movie} key={movie.imdbID} onselected={onselected} />
      ))}
    </ul>
  );
}

function Movie({movie, onselected}) {
  return (
    <li onClick={() => onselected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '–' : '+'}
      </button>

      {isOpen && children}
    </div>
  );
}
function MovieDetails({selectedId, onRemoveId, onAddWatch, watched, setError}) {
  const [movies, setMovies] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const {
    Actors: actors,
    Awards: awards,
    Director: director,
    Genre: genre,
    Plot: plot,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    Title: title,
    Type: type,
    Writer: writer,
    Website: website,
    Year: year,
    imdbRating,
    imdbID,
  } = movies;

  const stylesMovies = {
    fontSize: '2rem',
    fontWeight: 700,
  };

  const isWatched = watched.map(movies => movies.imdbID).includes(selectedId);
  const watchUserRating = watched.find(
    movies => movies.imdbID === selectedId
  )?.userRating;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };
    onAddWatch(newWatchedMovie);
    onRemoveId();
  }

  useEffect(
    function () {
      setIsLoading(true);
      async function getMovieDetails() {
        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${apiKey}&i=${selectedId} `
          );
          if (!res.ok) throw new Error(`Try again`);

          const data = await res.json();
          if (data.Response === 'False') throw new Error(`Network is bad`);

          setMovies(data);
        } catch (err) {
          setError(err.message);
        }
      }
      getMovieDetails();
      setIsLoading(false);
    },
    [selectedId]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `${type} | ${title}`;

      return function () {
        document.title = 'usePopCorn';
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              style={{display: 'inline'}}
              className="btn-back"
              onClick={onRemoveId}
            >
              &larr;
            </button>
            <img src={poster} alt={`poster of the ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                {' '}
                <span style={stylesMovies}>⭐</span> {imdbRating}
              </p>
              <p>
                {' '}
                <span style={stylesMovies}>Duration</span> : {runtime}
              </p>
              <p>
                {' '}
                <span style={stylesMovies}>Type</span> : {type}
              </p>
              {awards === 'N/A' ? (
                ''
              ) : (
                <p>
                  <span style={stylesMovies}>Award</span> : {awards}
                </p>
              )}{' '}
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched && (
                <>
                  {' '}
                  <StarRating
                    maxRating={10}
                    size={2}
                    onSetRating={setUserRating}
                  />
                  {userRating >= 1 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
              {isWatched && <p>You rated this movie {watchUserRating}⭐</p>}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>
              <span style={stylesMovies}>Writer</span>: {writer}
            </p>
            <p>
              {' '}
              <span style={stylesMovies}>Starring</span> : {actors}.
            </p>
            <p>
              <span style={stylesMovies}>Directed</span> by {director}.
            </p>
            {website === 'N/A' ? (
              ''
            ) : (
              <p>
                {' '}
                <span style={stylesMovies}>Download</span> : {website}
              </p>
            )}{' '}
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map(movie => movie.imdbRating));
  const avgUserRating = average(watched.map(movie => movie.userRating));
  const avgRuntime = average(watched.map(movie => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({watched, onDeleteWatched}) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <ListWatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function ListWatchedMovie({movie, onDeleteWatched}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
