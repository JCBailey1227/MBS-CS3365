
function filterGenre(selectedGenre) {
  const cards = document.querySelectorAll('.movie-card');

  cards.forEach(card => {
    const genres = card.getAttribute('data-genre')?.toLowerCase() || "";

    if (selectedGenre === 'all' || genres.includes(selectedGenre.toLowerCase())) {
      card.parentElement.style.display = 'block';
    } else {
      card.parentElement.style.display = 'none';  
    }
  });
}
  function searchMovies() {
    const input = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.movie-card');

    cards.forEach(card => {
      const overlayText = card.querySelector('.movie-description')?.textContent.toLowerCase() || '';
      const dataTitle = card.getAttribute('data-title')?.toLowerCase() || '';

      // Check if search term is in data-title
      if (dataTitle.includes(input)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

// API for Movie Data and Images
const apiKey = "6853f434"; // API key is limited to 1000 requests per day, go easy on clicks 

// Note that these are base IDs for display purposes, new IDs will be kept in local storage
let playingNowIDs = JSON.parse(localStorage.getItem("playingNowIDs")) || ["tt3566834", "tt6208148", "tt10954718"];
//const playingNowIDs = ["tt3566834", "tt6208148", "tt31193180"];
const upcomingIDs = ["tt7068946", "tt8866456", "tt19637220"];

// The two grids for the two sections of the page
const playingNowGrid = document.getElementById("playing-now-grid");
const upcomingGrid = document.getElementById("upcoming-grid");
/*
 *
 *  This can be replaced to whatever we need it to be later, just a placeholder for now
 *  
 * ADMIN KEYS: const adminKeys = ["INSERT_KEY_HERE", ...]
 * USER NAMES: const userNames = ["INSERT_NAME_HERE", ...] (Link this to database?)
 * 
 *
 */

// Function to fetch movie data from API using IMDb ID
async function fetchMovieData(id) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`);
  const data = await res.json();
  return data;
}

// Create movie card, then set attributes for searching
function createMovieCard(movie) {
  const card = document.createElement("a");
  card.href = `details.html?id=${movie.imdbID}`;
  card.classList.add("movie-card"); 

  // Set attributes for filtering/searching
  card.setAttribute("data-title", movie.Title);
  card.setAttribute("data-id", movie.imdbID);
  card.setAttribute("data-genre", movie.Genre);
  card.setAttribute("data-p_rating", movie.Rated);

  
  // *************** SHOULD BE ADMIN ONLY ***************
  //       Delete button to delete card
  card.innerHTML = `
    <button class="delete-button" onclick="removeMovieCard('${movie.imdbID}'); event.stopPropagation(); event.preventDefault();">X</button>
    <img src="${movie.Poster}" alt="${movie.Title}"><div class="movie-description">${movie.Plot || "No description available."}</div>`;

  return card;
}

// Loads movies into the grid, arguments for which grid to load into 
async function loadMovies(movieIDs, gridElement) {
  for (const id of movieIDs) {
    const movie = await fetchMovieData(id);
    if (movie && movie.Response === "True") {
      const card = createMovieCard(movie);
      gridElement.appendChild(card);
    } else {
      console.warn(`Movie not found for ID: ${id}`);
    }
  }
}
async function addMovieCard() {
  const userInput = document.getElementById("manual-imdb-id").value.trim();

  if (!userInput.startsWith("tt")) {
    alert("Enter a valid IMDb ID. Ensure it starts with 'tt'.");
    return;
  }

  // Avoid duplicates
  if (playingNowIDs.includes(userInput)) {
    alert("This movie is already added.");
    return;
  }

  const movie = await fetchMovieData(userInput);
  if (movie && movie.Response === "True") {
  
    playingNowIDs.push(userInput);

    
    localStorage.setItem("playingNowIDs", JSON.stringify(playingNowIDs));

    
    const card = createMovieCard(movie);
    document.getElementById("playing-now-grid").appendChild(card);

    document.getElementById("manual-imdb-id").value = ""; // Clear input
  } else {
    alert("Movie not found.");
  }
}
function removeMovieCard(imdbID) {
  const card = document.querySelector(`.movie-card[data-id="${imdbID}"]`);
  if (card) {
    card.remove();
  } else {
    console.warn(`No card found with ID: ${imdbID}`);
  }
 
  const index = playingNowIDs.indexOf(imdbID);
  if (index !== -1) {
    playingNowIDs.splice(index, 1);
    localStorage.setItem("playingNowIDs", JSON.stringify(playingNowIDs));
    playingNowIDs = JSON.parse(localStorage.getItem("playingNowIDs")) || [];
  } else {
    console.warn(`ID not found in playingNowIDs: ${imdbID}`);
  }
}

// Load in both sections
loadMovies(playingNowIDs, playingNowGrid);
loadMovies(upcomingIDs, upcomingGrid);
document.querySelectorAll('.movie-card').forEach(card => {
  const p_rating = card.getAttribute('data-rating');
  const description = card.querySelector('.movie-description');

  if (p_rating && description) {
    const ratingSpan = document.createElement('div');
    ratingSpan.className = 'parental-rating';
    ratingSpan.textContent = `Rated ${p_rating}`;
    description.prepend(ratingSpan);
  }
});
