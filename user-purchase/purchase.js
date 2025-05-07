// Listen for form submission
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default

  // Get selected payment method
  const paymentMethod = document.getElementById('payment-method').value;
  const cardNumber = document.getElementById('card-number')?.value.trim();
  const expiry = document.getElementById('expiry')?.value.trim();
  const cvv = document.getElementById('cvv')?.value.trim();

  // Ensure a payment method is selected
  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  //validate
  if (paymentMethod === "Credit Card") {
    if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      alert("Invalid card number. Card number must be 16 digits.");
      return;
    }
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      alert("Invalid expiry date format. Use MM/YY.");
      return;
    }
    if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
      alert("Invalid CVV. CVV must be 3 digits.");
      return;
    }
  }
  //Retrieve stored booking
  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));
  const email = localStorage.getItem('userEmail');
  const accommodation = localStorage.getItem('specialAccommodation');
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));

  if (!bookingInfo || !email || !selectedSeats || selectedSeats.length === 0) {
    alert('Missing booking information.');
    return;
  }
  // Generate and save a random ticket number
  const ticketNumber = 'TKT-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  localStorage.setItem('ticketNumber', ticketNumber);

  // Send booking request to server
  const res = await fetch("/book-seat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      "Movie Name": bookingInfo.movieName,
      location: bookingInfo.location,
      date: bookingInfo.date,
      time: bookingInfo.time,
      accommodation: accommodation || "No",
      "Selected Seats": selectedSeats.join(", "),
      paymentMethod: paymentMethod,
      ticketNumber: ticketNumber
    })
  });

  // Show response message and redirect if successful
  const msg = await res.json();
  alert(msg.message);

  if (res.ok) {
    window.location.href = "/user-purchase/confirmation.html";
  }
});

// Toggle visibility of credit card fields
document.getElementById('payment-method').addEventListener('change', () => {
  const method = document.getElementById('payment-method').value;
  const cardFields = ['card-name', 'card-number', 'expiry', 'cvv'];

  cardFields.forEach(id => {
    const field = document.getElementById(id);
    if (method === "Credit Card") {
      field.style.display = 'block';
      field.required = true;
    } else {
      field.style.display = 'none';
      field.required = false;
    }
  });
});
