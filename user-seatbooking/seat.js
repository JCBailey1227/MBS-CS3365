// Select necessary DOM elements
const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const bookNowButton = document.getElementById('booknow-button');

// Retrieve saved booking
const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));

// If movie exists, display it on the page
if (bookingInfo && bookingInfo.movieName) {
  document.getElementById('movie-title').textContent = bookingInfo.movieName;
}

// Populate UI with previously selected seats
populateUI();

// Set fixed ticket price
const ticketPrice = 10;

// Update seat count and total price
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');

  // Store indexes of selected seats
  const selectedSeatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));
  localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatsIndex));

  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;

  // Enable or disable "Book Now"
  bookNowButton.disabled = selectedSeatsCount === 0;
}

// Load seat selections
function populateUI() {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.indexOf(index) > -1) {
        seat.classList.add('selected');
      }
    });
  }
}

//Handle seat limit to 10 seats
container.addEventListener('click', e => {
  if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');

    //Prevent selecting more than 10 seats
    if (!e.target.classList.contains('selected') && selectedSeats.length >= 10) {
      alert('You can only book a maximum of 10 seats.');
      return;
    }

    //Toggle seat selection
    e.target.classList.toggle('selected');
    updateSelectedCount();
  }
});

// Handle "Book Now" button click
bookNowButton.addEventListener('click', () => {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  const accommodation = document.getElementById('accommodation-select').value;

  if (!selectedSeats || selectedSeats.length === 0) {
    alert('Please select at least one seat before proceeding.');
    return;
  }

  //Save accommodation preference
  localStorage.setItem('specialAccommodation', accommodation);

  //Preserve existing booking info
  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo')) || {};
  localStorage.setItem('bookingInfo', JSON.stringify({
    movieName: bookingInfo.movieName || '',
    location: bookingInfo.location || '',
    date: bookingInfo.date || '',
    time: bookingInfo.time || ''
  }));

  // Redirect to payment page
  window.location.href = "/user-purchase/purchase.html";
});

// Disable Book Now 
bookNowButton.disabled = true;

// Initial update of seat count and price
updateSelectedCount();
