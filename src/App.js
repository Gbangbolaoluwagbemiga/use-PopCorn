import {useEffect, useState} from 'react';
import StarRating from './starRating';
import {useRef} from 'react';
import {useMovies} from './useMovies';
import {useLocalStorage} from './useLocalStorage';
import {useKey} from './useKey';

const apiKey = `2834ffac`;

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const {movies, isLoading, error} = useMovies(query, handleRemoveId);
  const [watched, setWatchMovies] = useLocalStorage([], 'watched');

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
              // setError={setError}
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
  const searcher = useRef(null);
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === searcher.current) return;
        if (e.code === 'Enter') {
          searcher.current.focus();
          setQuery('');
        }
      }
      document.addEventListener('keydown', callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={searcher}
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

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current += 1;
    },
    [userRating]
  );

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
      numberOfCount: countRef.current,
    };
    onAddWatch(newWatchedMovie);
    onRemoveId();
  }

  useKey('Escape', onRemoveId);
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
    [selectedId, setError]
  );
  useEffect(
    function () {
      if (!title) return;
      document.title = `${type} | ${title}`;

      return function () {
        document.title = 'usePopCorn';
      };
    },
    [title, type]
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
