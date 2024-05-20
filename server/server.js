import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import xss from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import dbConnection from './dbConfig/dbConnection.js';
import User from './models/userModel.js';  // import the user model

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8800;

// DB CONNECTION
dbConnection();

// middleware
app.use(cors());
app.use(xss());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Route for signup
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Listen
app.listen(PORT, () => {
    console.log(`Development server running on port: ${PORT}`);
});
