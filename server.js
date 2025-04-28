const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve static files

const EXCEL_FILE = "users.xlsx";

// create Excel if doesn't exist
if (!fs.existsSync(EXCEL_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, EXCEL_FILE);
}

function readUsers() {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets["Users"];
    return XLSX.utils.sheet_to_json(sheet);
}

function writeUser(user) {
    const users = readUsers();
    users.push(user);
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, EXCEL_FILE);
}

app.post("/register", (req, res) => {
    const { name, email, phone, address, password } = req.body;
    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email already exists" });
    }
    writeUser({ name, email, phone, address, password });
    res.json({ message: "Registration successful" });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// serve index.html manually
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/forgot-password", (req, res) => {
  const { email, newPassword } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Email not found" });
  }

  // Update password
  users[userIndex].password = newPassword;

  // Write back to Excel
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, EXCEL_FILE);

  res.json({ message: "Password reset successfully! Please log in again." });
});
// Get user profile
app.post("/get-profile", (req, res) => {
  const { email } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// Update user profile
app.post("/update-profile", (req, res) => {
  const { email, name, phone, address, password } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userIndex] = { name, email, phone, address, password };

  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, EXCEL_FILE);

  res.json({ message: "Profile updated successfully!" });
});

const MOVIESHOWS_FILE = path.join(__dirname, "movieshowtimes.xlsx");
const BOOKINGS_FILE = path.join(__dirname, "bookings.xlsx");



// Create movieshowtimes.xlsx if not exist
if (!fs.existsSync(MOVIESHOWS_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Showtimes");
    XLSX.writeFile(wb, MOVIESHOWS_FILE);
}

// Create bookings.xlsx if not exist
if (!fs.existsSync(BOOKINGS_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, BOOKINGS_FILE);
}

// API to get showtimes for a selected movie
app.post("/get-showtimes", (req, res) => {
  const { movieName: receivedMovieName } = req.body;
  console.log("Requested movieName:", receivedMovieName);  // DEBUG LOG

  const workbook = XLSX.readFile(MOVIESHOWS_FILE);
  const sheet = workbook.Sheets["Showtimes"];
  const allShows = XLSX.utils.sheet_to_json(sheet);

  const filteredShows = allShows.filter(show => 
    show["Movie Name"].toLowerCase().trim() === receivedMovieName.toLowerCase().trim()
  );

  console.log("Filtered Shows:", filteredShows);
  res.json(filteredShows);
});

app.post("/book-seat", (req, res) => {
  const { email, location, date, time, accommodation, "Movie Name": movieName, "Selected Seats": selectedSeats, paymentMethod, ticketNumber } = req.body;

  const workbook = XLSX.readFile(BOOKINGS_FILE);
  const sheet = workbook.Sheets["Bookings"];
  const currentBookings = XLSX.utils.sheet_to_json(sheet);

  currentBookings.push({ 
    "User Email": email, 
    "Movie Name": movieName, 
    "Location": location, 
    "Date": date, 
    "Time": time, 
    "Accommodation": accommodation || "No",
    "Selected Seats": selectedSeats || "",
    "Payment Method": paymentMethod || "Credit Card",
    "Confirmation Number": ticketNumber || "N/A"
  });

  const newSheet = XLSX.utils.json_to_sheet(currentBookings);
  const newWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWb, newSheet, "Bookings");
  XLSX.writeFile(newWb, BOOKINGS_FILE);

  res.json({ message: "Booking confirmed!" });
});


// Get bookings for a user
app.post("/get-bookings", (req, res) => {
  const { email } = req.body;
  const workbook = XLSX.readFile(BOOKINGS_FILE);
  const sheet = workbook.Sheets["Bookings"];
  const allBookings = XLSX.utils.sheet_to_json(sheet);

  const userBookings = allBookings.filter(b => b["User Email"] === email);

  res.json(userBookings);
});
// API to add a new showtime
app.post("/add-showtime", (req, res) => {
  const { movieName, location, date, time, price } = req.body;

  const workbook = XLSX.readFile(MOVIESHOWS_FILE);
  const sheet = workbook.Sheets["Showtimes"];
  const shows = XLSX.utils.sheet_to_json(sheet);

  shows.push({
    "Movie Name": movieName,
    Location: location,
    Date: date,
    Times: time,
    Price: price
  });

  const newSheet = XLSX.utils.json_to_sheet(shows);
  const newWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWb, newSheet, "Showtimes");
  XLSX.writeFile(newWb, MOVIESHOWS_FILE);

  res.json({ message: "Showtime added successfully!" });
});

// API to remove a showtime
app.post("/remove-showtime", (req, res) => {
  const { movieName, location, date, time } = req.body;

  const workbook = XLSX.readFile(MOVIESHOWS_FILE);
  const sheet = workbook.Sheets["Showtimes"];
  let shows = XLSX.utils.sheet_to_json(sheet);

  const originalLength = shows.length;

  shows = shows.filter(show => 
    !(
      show["Movie Name"].toLowerCase().trim() === movieName.toLowerCase().trim() &&
      show.Location.toLowerCase().trim() === location.toLowerCase().trim() &&
      show.Date.toLowerCase().trim() === date.toLowerCase().trim() &&
      show.Times.toLowerCase().trim() === time.toLowerCase().trim()
    )
  );

  if (shows.length === originalLength) {
    return res.status(404).json({ message: "Showtime not found!" });
  }

  const newSheet = XLSX.utils.json_to_sheet(shows);
  const newWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWb, newSheet, "Showtimes");
  XLSX.writeFile(newWb, MOVIESHOWS_FILE);

  res.json({ message: "Showtime removed successfully!" });
});

// Admin API to fetch all bookings
app.get("/admin-get-bookings", (req, res) => {
  const workbook = XLSX.readFile(BOOKINGS_FILE);
  const sheet = workbook.Sheets["Bookings"];
  const bookings = XLSX.utils.sheet_to_json(sheet);

  res.json(bookings);
});
// API to get all showtimes (for checking in profile page)
app.get("/get-all-showtimes", (req, res) => {
  const workbook = XLSX.readFile(MOVIESHOWS_FILE);
  const sheet = workbook.Sheets["Showtimes"];
  const allShows = XLSX.utils.sheet_to_json(sheet);

  res.json(allShows);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
