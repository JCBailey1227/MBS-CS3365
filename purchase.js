document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const paymentMethod = document.getElementById('payment-method').value;
  const cardNumber = document.getElementById('card-number')?.value.trim();
  const expiry = document.getElementById('expiry')?.value.trim();
  const cvv = document.getElementById('cvv')?.value.trim();

  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

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

  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo'));
  const email = localStorage.getItem('userEmail');
  const accommodation = localStorage.getItem('specialAccommodation');
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));

  if (!bookingInfo || !email || !selectedSeats || selectedSeats.length === 0) {
    alert('Missing booking information.');
    return;
  }

  const ticketNumber = 'TKT-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  localStorage.setItem('ticketNumber', ticketNumber);

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

  const msg = await res.json();
  alert(msg.message);

  if (res.ok) {
    window.location.href = "confirmation.html";
  }
});

// 🎯 Handle dynamic hiding of card details
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
