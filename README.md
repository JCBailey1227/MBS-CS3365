# Movie Booking System - CS3365

This project is a basic movie ticket booking web application that uses Node.js for the backend and Excel files for storing data. It includes user login, admin controls, seat selection, and purchase flow.

## Project Structure

```
.
├── server.js                   # Main backend server
├── databases/                  # All Excel files used as databases
│   ├── users.xlsx
│   ├── bookings.xlsx
│   ├── movies.xlsx
│   └── movieshowtimes.xlsx
├── posters/                    # Uploaded poster images
├── user-login/                 # Login and Register pages
├── user-homepage/              # Homepage and Profile page
├── user-admin/                 # Admin dashboard
├── user-seatbooking/           # Seat selection page
├── user-purchase/              # Payment and confirmation pages
├── sample-posters/             # Sample posters to upload
└── README.md
```

## How to Run This Project

1. **Install Node.js** (https://nodejs.org)

2. **Open a terminal** in the project folder and run:

   ```bash
   npm install express body-parser cors multer xlsx
   ```

3. **Start the server:**

   ```bash
   node server.js
   ```

4. **Open your browser and go to:**

   ```
   http://localhost:3000
   ```

## Notes

- All data is stored in `.xlsx` files inside the `databases` folder.
- Server creates Excel files if they don’t already exist.
- Poster images are stored in the `posters/` folder.
