// server.js
require('dotenv').config(); // Load environment variables from .env file
console.log('--- Server script started! ---'); // Debugging line

const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model
const Book = require('./models/Book'); // Import the Book model
const path = require('path'); // Node.js built-in module for working with file paths

// --- Add this block for comprehensive error logging ---
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception 🚨:', err);
    process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection ⚠️:', reason);
    // You might want to log more details about the promise here
});
// --- End of added block ---

const app = express();
const PORT = process.env.PORT || 3000; // Use port from environment variable or default to 3000
const MONGODB_URI = process.env.MONGODB_URI; // Get MongoDB URI from .env

// --- Initial Book Data for Population ---
const initialBooks = [
    { id: 'b001', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', quantity: 1 },
    { id: 'b002', title: '1984', author: 'George Orwell', quantity: 5 },
    { id: 'b003', title: 'To Kill a Mockingbird', author: 'Harper Lee', quantity: 3 },
    { id: 'b004', title: 'Pride and Prejudice', author: 'Jane Austen', quantity: 2 },
    { id: 'b005', title: 'The Catcher in the Rye', author: 'J.D. Salinger', quantity: 4 },
    { id: 'b006', title: 'The Hobbit', author: 'J.R.R. Tolkien', quantity: 3 },
    { id: 'b007', title: 'Lord of the Flies', author: 'William Golding', quantity: 2 },
    { id: 'b008', title: 'Animal Farm', author: 'George Orwell', quantity: 5 },
    { id: 'b009', title: 'Brave New World', author: 'Aldous Huxley', quantity: 2 },
    { id: 'b010', title: 'The Odyssey', author: 'Homer', quantity: 3 }
];

// Function to add initial books if the 'books' collection is empty
async function addInitialBooks() {
    try {
        const count = await Book.countDocuments();
        if (count === 0) {
            await Book.insertMany(initialBooks);
            console.log('📚 Initial books added to database.');
        } else {
            console.log('📚 Books already exist in database. Skipping initial population.');
        }
    } catch (err) {
        console.error('❌ Error adding initial books:', err);
    }
}

// --- Middleware ---
// 1. express.json(): Parses incoming JSON requests and puts the parsed data in req.body.
app.use(express.json());

// 2. express.static(): Serves static files (like your HTML, CSS, and JS) from the 'public' directory.
// When a browser requests 'http://localhost:3000/register.html', Express will look for it in 'public'.
app.use(express.static(path.join(__dirname, 'public')));

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
        addInitialBooks(); // Call the function to populate books after successful connection
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message); // Log the specific error message
        // Optionally, exit the process if DB connection is critical for startup
        // process.exit(1);
    });

// --- API Endpoints ---

// POST /api/register - Handles new user registration
app.post('/api/register', async (req, res) => {
    try {
        // Extract user data from the request body
        const {
            fullName, fatherName, mobile, email, password,
            collegeName, enrollmentNumber, branch, year, dob,
            gender, address, securityQuestion, securityAnswer
        } = req.body;

        // Basic server-side validation for required fields
        if (!fullName || !mobile || !email || !password || !collegeName ||
            !enrollmentNumber || !branch || !dob || !gender || !address ||
            !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: 'Please enter all required fields.' });
        }

        // Check if a user with the same email already exists
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ message: 'User with this email already exists. Try logging in or use a different email.' });
        }

        // Check if a user with the same mobile number already exists
        let userByMobile = await User.findOne({ mobile });
        if (userByMobile) {
            return res.status(400).json({ message: 'User with this mobile number already exists. Try logging in or use a different mobile number.' });
        }

        // Check if a user with the same enrollment number already exists
        let userByEnrollment = await User.findOne({ enrollmentNumber });
        if (userByEnrollment) {
            return res.status(400).json({ message: 'User with this enrollment number already exists.' });
        }

        // Create a new User instance with the received data
        // The password will be automatically hashed by the pre-save hook in models/User.js
        const newUser = new User({
            fullName, fatherName, mobile, email, password,
            collegeName, enrollmentNumber, branch, year, dob,
            gender, address, securityQuestion, securityAnswer
        });

        // Save the new user to the database
        await newUser.save();

        // Send a success response
        res.status(201).json({ message: 'Registration successful! You can now log in.' });

    } catch (error) {
        // Log the error for debugging purposes
        console.error('❌ Registration error:', error);
        // Send a generic error response to the client
        res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
});

// POST /api/login - Handles user login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation for login credentials
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password.' });
        }

        // Find the user by email in the database
        const user = await User.findOne({ email });

        // If user not found
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the provided password with the hashed password in the database
        // using the matchPassword method defined in the User model
        const isMatch = await user.matchPassword(password);

        // If passwords do not match
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // If login is successful
        // In a real application, you would generate and send a JWT (JSON Web Token) here
        // to manage user sessions and authorize access to protected routes.
        // For this basic setup, we'll just send a success message.
        res.status(200).json({ message: 'Login successful! Redirecting to library.' });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error during login. Please try again later.' });
    }
});

// GET /api/books - Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({}); // Fetch all books
        res.status(200).json(books);
    } catch (error) {
        console.error('❌ Error fetching books:', error);
        res.status(500).json({ message: 'Server error fetching books. Please try again later.' });
    }
});

// POST /api/books/issue - Issue a book
app.post('/api/books/issue', async (req, res) => {
    const { bookId, userId } = req.body; // userId will be the libraryNumber

    if (!bookId || !userId) {
        return res.status(400).json({ message: 'Book ID and User ID are required.' });
    }

    try {
        const book = await Book.findOne({ id: bookId });

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        if (book.quantity <= 0) {
            return res.status(400).json({ message: `"${book.title}" currently has no copies available.` });
        }

        book.quantity--; // Decrement available quantity
        await book.save(); // Save the updated book

        // *** IMPORTANT NOTE on Issued Books Handling ***
        // For a robust system, you would:
        // 1. Create a new Mongoose model (e.g., 'IssuedBook.js') with fields like bookId, userId, issueDate, returnDate.
        // 2. Import that model here.
        // 3. Create a new instance of IssuedBook and save it to a separate 'issuedbooks' collection.
        // This current setup only updates the Book's quantity, not tracks individual issues in a dedicated collection.
        // The client-side 'issuedBooks' array is still a temporary placeholder.

        res.status(200).json({ message: `"${book.title}" issued successfully.`, updatedBook: book });

    } catch (error) {
        console.error('❌ Error issuing book:', error);
        res.status(500).json({ message: 'Server error during book issue. Please try again later.' });
    }
});

// POST /api/books/return - Return a book
app.post('/api/books/return', async (req, res) => {
    const { bookId, userId } = req.body; // userId will be the libraryNumber

    if (!bookId || !userId) {
        return res.status(400).json({ message: 'Book ID and User ID are required.' });
    }

    try {
        const book = await Book.findOne({ id: bookId });

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        book.quantity++; // Increment available quantity
        await book.save(); // Save the updated book

        // *** IMPORTANT NOTE on Issued Books Handling ***
        // If you were tracking issued books in a separate collection (as described above for issue),
        // you would delete the corresponding 'IssuedBook' record here.

        res.status(200).json({ message: `"${book.title}" returned successfully.`, updatedBook: book });

    } catch (error) {
        console.error('❌ Error returning book:', error);
        res.status(500).json({ message: 'Server error during book return. Please try again later.' });
    }
});


// GET /library.html - This route ensures direct access to library.html works
// although usually you'd redirect here after successful login from login.js
app.get('/library.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'library.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Open http://localhost:${PORT}/register.html to start.`);
});