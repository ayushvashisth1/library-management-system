// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    mobile: { type: String, required: true, unique: true, match: /^[0-9]{10}$/ },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    collegeName: { type: String, required: true, trim: true },
    enrollmentNumber: { type: String, required: true, unique: true, trim: true },
    branch: { type: String, required: true, trim: true },
    year: { type: String, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    photoPath: { type: String }, // To store the path to the user's photo (will be handled later)
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true, trim: true },
    registrationDate: { type: Date, default: Date.now } // Automatically adds creation date
});

// Middleware to hash password before saving the user
// 'pre' hook runs before the 'save' event
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    // Generate a salt (random string) and hash the password
    const salt = await bcrypt.genSalt(10); // 10 is the number of rounds for hashing, higher is more secure but slower
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password during login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;