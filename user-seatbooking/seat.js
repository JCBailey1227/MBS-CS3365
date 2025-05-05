const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const bookNowButton = document.getElementById('booknow-button');
const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));
if (bookingInfo && bookingInfo.movieName) {
  document.getElementById('movie-title').textContent = bookingInfo.movieName;
}
populateUI();
const ticketPrice = 10;
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');
  const selectedSeatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));
  localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatsIndex));

  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
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
  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo')) || {};
  localStorage.setItem('bookingInfo', JSON.stringify({
    movieName: bookingInfo.movieName || '',
    location: bookingInfo.location || '',
    date: bookingInfo.date || '',
    time: bookingInfo.time || ''
  }));
  window.location.href = "/user-purchase/purchase.html";
});
bookNowButton.disabled = true;
updateSelectedCount();
