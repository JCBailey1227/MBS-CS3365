const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const bookNowButton = document.getElementById('booknow-button');

// Display movie title dynamically
const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));
if (bookingInfo && bookingInfo.movieName) {
  document.getElementById('movie-title').textContent = bookingInfo.movieName;
}

populateUI();

// Ticket price is fixed (example: $10)
const ticketPrice = 10;

function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');

  const selectedSeatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));

  localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatsIndex));

  const selectedSeatsCount = selectedSeats.length;

  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;

  // Enable or disable book now button
  bookNowButton.disabled = selectedSeatsCount === 0;
}

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

container.addEventListener('click', e => {
  if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    
    // If already 10 seats selected and user tries to select another
    if (!e.target.classList.contains('selected') && selectedSeats.length >= 10) {
      alert('You can only book a maximum of 10 seats.');
      return;
    }

    e.target.classList.toggle('selected');
    updateSelectedCount();
  }
});

bookNowButton.addEventListener('click', () => {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  const accommodation = document.getElementById('accommodation-select').value;

  if (!selectedSeats || selectedSeats.length === 0) {
    alert('Please select at least one seat before proceeding.');
    return;
  }

  localStorage.setItem('specialAccommodation', accommodation);

  // 🛠️ FIX: Save full bookingInfo properly before moving to payment page
  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo')) || {};

  localStorage.setItem('bookingInfo', JSON.stringify({
    movieName: bookingInfo.movieName || '',
    location: bookingInfo.location || '',
    date: bookingInfo.date || '',
    time: bookingInfo.time || ''
  }));

  window.location.href = "purchase.html";
});

// Initially disable Proceed to Payment button
bookNowButton.disabled = true;

updateSelectedCount();
