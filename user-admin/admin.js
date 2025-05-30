function logout() 
{
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userEmail');
  window.location.href = "/user-login/loggedout.html";
}

document.getElementById('add-movie-form').addEventListener('submit',async (e) => 
{
  e.preventDefault();
  const formData = new FormData();
  formData.append('poster',document.getElementById('poster').files[0]);
  formData.append('movieName',document.getElementById('movie-name').value.trim());
  formData.append('rating',document.getElementById('rating').value.trim());
  formData.append('synopsis',document.getElementById('synopsis').value.trim());
  formData.append('status',document.getElementById('status').value.trim());
  const res = await fetch('/add-movie',{method:'POST',body:formData});
  const msg = await res.json();
  alert(msg.message);
  if (res.ok) document.getElementById('add-movie-form').reset();
});

//Add Showtime
document.getElementById('add-showtime-form').addEventListener('submit', async (e) =>
{
  e.preventDefault();
  const movieName = document.getElementById('show-movie-name').value.trim();
  const location = document.getElementById('location').value.trim();
  const date = document.getElementById('date').value.trim();
  const time = document.getElementById('time').value.trim();
  const price = document.getElementById('price').value.trim();

  const res = await fetch('/add-showtime',
  {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ movieName, location, date, time, price})
  });

  const msg = await res.json();
  alert(msg.message);
  if(res.ok)document.getElementById('add-showtime-form').reset();
});

//Remove Showtime
document.getElementById('remove-showtime-form').addEventListener('submit', async (e) =>
{
  e.preventDefault();
  const movieName = document.getElementById('remove-movie-name').value.trim();
  const location = document.getElementById('remove-location').value.trim();
  const date = document.getElementById('remove-date').value.trim();
  const time = document.getElementById('remove-time').value.trim();

  const res = await fetch('/remove-showtime',
  {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ movieName, location, date, time })
  });

  const msg = await res.json();
  alert(msg.message);
  if (res.ok) document.getElementById('remove-showtime-form').reset();
});

//Fetch bookings
async function fetchBookings() 
{
  const res = await fetch('/admin-get-bookings');
  const bookings = await res.json();
  const table = document.getElementById('bookings-table');
  const tbody = document.getElementById('bookings-body');
  tbody.innerHTML = '';

  bookings.forEach(b =>
    {
    const row = document.createElement('tr');
    row.innerHTML =
    `
      <td>${b["User Email"]}</td>
      <td>${b["Movie Name"]}</td>
      <td>${b.Location}</td>
      <td>${b.Date}</td>
      <td>${b.Time}</td>
      <td>${b["Selected Seats"]}</td>
      <td>${b.Accommodation}</td>
      <td>${b["Confirmation Number"] || "N/A"}</td>
      <td>${b.Status || "Active"}</td>
      <td>${b.Status === "Active"?`<button onclick="deactivateBooking('${b["Confirmation Number"]}')">Deactivate</button>`:''}</td>
    `;
    tbody.appendChild(row);
    });
  table.style.display='table';
}

//Deactivate booking
async function deactivateBooking(confirmationNumber) {
  if (!confirmationNumber) return alert("Invalid booking.");
  const res = await fetch('/deactivate-booking',
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({confirmationNumber})
  });
  const msg = await res.json();
  alert(msg.message);
  if (res.ok) fetchBookings();
}
