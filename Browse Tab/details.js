const apiKey = "6853f434"; // Limited to 1000 requests per day, go easy on clicks

// Upcoming movie IDs also have to be added to this duplicate array
// to prevent booking for them.
const upcomingIDs = ["tt7068946", "tt8866456", "tt19637220"]; 

// Get IMDb ID 
const params = new URLSearchParams(window.location.search);
const imdbId = params.get("id");
// sales = JSON.parse(localStorage.getItem("sales")) || []; OR SOMETHING ALONG THOSE LINES


async function fetchMovie(imdbId) {
  try {
    // Print the IMDb ID to the console for debugging
    console.log("Fetching movie with IMDb ID:", imdbId);

    const response = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=6853f434`);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();

    if (data.Response === "True") {
      displayMovieData(data);
    } else {
      document.body.innerHTML = `<h1 class="not-found">Movie not found: ${data.Error}</h1>`;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    document.body.innerHTML = `<h1 class="not-found">Something went wrong.</h1>`;
  }
}

function displayMovieData(movie) {
  document.getElementById("movie-title").textContent = movie.Title;
  document.getElementById("movie-description").textContent = movie.Plot;
  document.getElementById("movie-genre").textContent = movie.Genre;
  document.getElementById("movie-rating").textContent = movie.Rated;
  document.getElementById("movie-year").textContent = movie.Year;
  document.getElementById("movie-img").src = movie.Poster;
  document.getElementById("movie-img").alt = movie.Title;

  // Disables booking button if movie is upcoming rather than playing now
  const bookButton = document.getElementById("book-button");
  if (upcomingIDs.includes(movie.imdbID)) {
    bookButton.style.pointerEvents = "none";
    bookButton.style.backgroundColor = "#888";
    bookButton.style.cursor = "not-allowed";
    bookButton.style.opacity = "0.5";
    bookButton.textContent = "Coming Soon";
    bookButton.href = "#"; 
  }
  displayReviews(movie.imdbID);
}

fetchMovie(imdbId);
// Fetch movie reviews
function getStoredReviews(imdbId) {
return JSON.parse(localStorage.getItem("reviews_" + imdbId)) || [];
}

/* Huge block for review functionality */ 
function saveReview(imdbId, review) {
const reviews = getStoredReviews(imdbId);
reviews.push(review);
localStorage.setItem("reviews_" + imdbId, JSON.stringify(reviews));
}

function displayReviews(imdbId) {
const reviews = getStoredReviews(imdbId);
const list = document.getElementById("review-list");
list.innerHTML = "";

if (reviews.length === 0) {
list.innerHTML = "<p>No reviews yet.</p>";
return;
}

reviews.forEach((text, index) => {
const container = document.createElement("div");
container.style.display = "flex";
container.style.justifyContent = "space-between";
container.style.alignItems = "center";
container.style.borderBottom = "1px solid #ddd";
container.style.padding = "0.5em 0";
const reviewText = document.createElement("p");
reviewText.textContent = `• ${text}`;
reviewText.style.margin = "0";
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "🗑️";
deleteBtn.style.background = "none";
deleteBtn.style.border = "none";
deleteBtn.style.cursor = "pointer";
deleteBtn.style.fontSize = "1rem";
deleteBtn.title = "Delete review";

deleteBtn.onclick = () => {
  deleteReview(imdbId, index);
};

container.appendChild(reviewText);
container.appendChild(deleteBtn);
list.appendChild(container);
});
}

// Delete review function
function deleteReview(imdbId, index) {
const reviews = getStoredReviews(imdbId);
reviews.splice(index, 1); // Remove the review at the index
localStorage.setItem("reviews_" + imdbId, JSON.stringify(reviews));
displayReviews(imdbId); // Re-render the reviews after deletion
}

function submitReview() {
const reviewInput = document.getElementById("review-input");
const review = reviewInput.value.trim();

if (review === "") {
alert("Please write something!");
return;
}

saveReview(imdbId, review);
displayReviews(imdbId);
reviewInput.value = "";
}