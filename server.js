const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve homepage
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'user-homepage', 'homepage.html'));
});

// Static file routes
app.use(express.static(__dirname));
app.use('/user-login', express.static(path.join(__dirname, 'user-login')));
app.use('/user-homepage', express.static(path.join(__dirname, 'user-homepage')));
app.use('/user-admin', express.static(path.join(__dirname, 'user-admin')));
app.use('/user-seatbooking', express.static(path.join(__dirname, 'user-seatbooking')));
app.use('/user-purchase', express.static(path.join(__dirname, 'user-purchase')));
app.use('/sample-posters', express.static(path.join(__dirname, 'sample-posters')));
app.use('/posters', express.static(path.join(__dirname, 'posters')));

// Excel paths
const EXCEL_FILE = path.join(__dirname, "databases", "users.xlsx");
const MOVIESHOWS_FILE = path.join(__dirname, "databases", "movieshowtimes.xlsx");
const BOOKINGS_FILE = path.join(__dirname, "databases", "bookings.xlsx");
const MOVIES_FILE = path.join(__dirname, "databases", "movies.xlsx");

// Create Excel if not exist
function createExcelIfNotExist(filename, sheetname)
{
    if (!fs.existsSync(filename))
    {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, sheetname);
        XLSX.writeFile(wb, filename);
    }
}
createExcelIfNotExist(EXCEL_FILE, "Users");
createExcelIfNotExist(MOVIESHOWS_FILE, "Showtimes");
createExcelIfNotExist(BOOKINGS_FILE, "Bookings");
createExcelIfNotExist(MOVIES_FILE, "Movies");

// Read/write users
function readUsers()
{
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets["Users"];
    return XLSX.utils.sheet_to_json(sheet);
}
function writeUser(user)
{
    const users = readUsers();
    users.push(user);

    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, EXCEL_FILE);
}

// Upload config
const upload = multer({
    dest: 'posters/',
    fileFilter: (req, file, cb) =>
    {
        const ext = file.originalname.toLowerCase();
        if (ext.endsWith('.jpg') || ext.endsWith('.jpeg'))
        {
            cb(null, true);
        }
        else
        {
            cb(new Error('Only JPG and JPEG images are allowed.'));
        }
    }
});

// Register/Login
app.post("/register", (req, res) =>
{
    const { name, email, phone, address, password } = req.body;
    const users = readUsers();
    if (users.find(u => u.email === email))
    {
        return res.status(400).json({ message: "Email already exists" });
    }
    writeUser({ name, email, phone, address, password });
    res.json({ message: "Registration successful" });
});

app.post("/login", (req, res) =>
{
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user)
    {
        res.json({ message: "Login successful" });
    }
    else
    {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

app.post("/get-profile", (req, res) =>
{
    const { email } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user)
    {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});

app.post("/forgot-password", (req, res) =>
{
    const { email, newPassword } = req.body;
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1)
    {
        return res.status(404).json({ message: "Email not found" });
    }
    users[idx].password = newPassword;
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, EXCEL_FILE);
    res.json({ message: "Password reset successfully" });
});

app.post("/update-profile", (req, res) =>
{
    const { email, name, phone, address, password } = req.body;
    const users = readUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1)
    {
        return res.status(404).json({ message: "User not found" });
    }
    users[idx] = { name, email, phone, address, password };
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, EXCEL_FILE);
    res.json({ message: "Profile updated successfully" });
});

// Add/Remove Showtimes
app.post("/add-showtime", (req, res) =>
{
    const { movieName, location, date, time, price } = req.body;
    const workbook = XLSX.readFile(MOVIESHOWS_FILE);
    const sheet = workbook.Sheets["Showtimes"];
    const shows = XLSX.utils.sheet_to_json(sheet);
    shows.push({ "Movie Name": movieName, Location: location, Date: date, Times: time, Price: price });
    const newSheet = XLSX.utils.json_to_sheet(shows);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, "Showtimes");
    XLSX.writeFile(newWb, MOVIESHOWS_FILE);
    res.json({ message: "Showtime added successfully" });
});

app.post("/remove-showtime", (req, res) =>
{
    const { movieName, location, date, time } = req.body;
    const workbook = XLSX.readFile(MOVIESHOWS_FILE);
    const sheet = workbook.Sheets["Showtimes"];
    let shows = XLSX.utils.sheet_to_json(sheet);
    shows = shows.filter(show =>
        !(show["Movie Name"].toLowerCase().trim() === movieName.toLowerCase().trim() &&
          show.Location.toLowerCase().trim() === location.toLowerCase().trim() &&
          show.Date.toLowerCase().trim() === date.toLowerCase().trim() &&
          show.Times.toLowerCase().trim() === time.toLowerCase().trim())
    );
    const newSheet = XLSX.utils.json_to_sheet(shows);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, "Showtimes");
    XLSX.writeFile(newWb, MOVIESHOWS_FILE);
    res.json({ message: "Showtime removed successfully" });
});

// Book Seat
app.post("/book-seat", (req, res) =>
{
    const {
        email, location, date, time, accommodation,
        "Movie Name": movieName,
        "Selected Seats": selectedSeats,
        paymentMethod, ticketNumber
    } = req.body;

    const workbook = XLSX.readFile(BOOKINGS_FILE);
    const sheet = workbook.Sheets["Bookings"];
    const bookings = XLSX.utils.sheet_to_json(sheet);

    bookings.push({
        "User Email": email,
        "Movie Name": movieName,
        "Location": location,
        "Date": date,
        "Time": time,
        "Accommodation": accommodation || "No",
        "Selected Seats": selectedSeats || "",
        "Payment Method": paymentMethod || "Credit Card",
        "Confirmation Number": ticketNumber || "N/A",
        "Status": "Active"
    });

    const newSheet = XLSX.utils.json_to_sheet(bookings);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, "Bookings");
    XLSX.writeFile(newWb, BOOKINGS_FILE);

    res.json({ message: "Booking confirmed!" });
});

// Admin View
app.get("/admin-get-bookings", (req, res) =>
{
    const workbook = XLSX.readFile(BOOKINGS_FILE);
    const sheet = workbook.Sheets["Bookings"];
    const bookings = XLSX.utils.sheet_to_json(sheet);
    res.json(bookings);
});

app.get("/get-all-showtimes", (req, res) =>
{
    const workbook = XLSX.readFile(MOVIESHOWS_FILE);
    const sheet = workbook.Sheets["Showtimes"];
    res.json(XLSX.utils.sheet_to_json(sheet));
});

app.get("/get-all-movies", (req, res) =>
{
    const workbook = XLSX.readFile(MOVIES_FILE);
    const sheet = workbook.Sheets["Movies"];
    res.json(XLSX.utils.sheet_to_json(sheet));
});

app.post("/deactivate-booking", (req, res) =>
{
    const { confirmationNumber } = req.body;
    const workbook = XLSX.readFile(BOOKINGS_FILE);
    const sheet = workbook.Sheets["Bookings"];
    const bookings = XLSX.utils.sheet_to_json(sheet);
    const booking = bookings.find(b => b["Confirmation Number"] === confirmationNumber);
    if (!booking)
    {
        return res.status(404).json({ message: "Booking not found." });
    }
    booking.Status = "Not Active";
    const newSheet = XLSX.utils.json_to_sheet(bookings);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, "Bookings");
    XLSX.writeFile(newWb, BOOKINGS_FILE);
    res.json({ message: "Booking deactivated successfully." });
});

// Add movie
app.post("/add-movie", upload.single('poster'), (req, res) =>
{
    if (!req.file)
    {
        return res.status(400).json({ message: 'Poster image missing or invalid format (must be JPG/JPEG).' });
    }

    const { movieName, rating, synopsis, status } = req.body;
    const poster = req.file.filename;
    const workbook = XLSX.readFile(MOVIES_FILE);
    const sheet = workbook.Sheets["Movies"];
    const movies = XLSX.utils.sheet_to_json(sheet);

    movies.push({
        "Movie Name": movieName,
        "Poster": `/posters/${poster}`,
        "Rating": rating,
        "Synopsis": synopsis,
        "Status": status
    });

    const newSheet = XLSX.utils.json_to_sheet(movies);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newSheet, "Movies");
    XLSX.writeFile(newWb, MOVIES_FILE);

    res.json({ message: "Movie added successfully!" });
});

app.post("/get-bookings", (req, res) =>
{
    const { email } = req.body;
    const workbook = XLSX.readFile("bookings.xlsx");
    const sheet = workbook.Sheets["Bookings"];
    const bookings = XLSX.utils.sheet_to_json(sheet);
    res.json(bookings.filter(b => b["User Email"] === email));
});

// Start server
app.listen(3000, () =>
{
    console.log("Server running on http://localhost:3000");
});
