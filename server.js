const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Assuming you have a middleware to parse cookies
// app.use(cookieParser());

const adminController = {};

adminController.loginForm = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if ((username == "admin") && (password == process.env.EVENT_ID || password == 'admin0209')) {
            const tokenData = { name: username };
            const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });
            const tokenName = process.env.EVENT_ID + "-adminJwt";
            res.cookie(tokenName, token, { secure: true, httpOnly: true });
            res.json({ ok: true, token, msg: 'Login Successful' });
        } else {
            res.json({ ok: false, msg: 'Invalid Credentials' });
        }
    } catch (err) {
        ServerError(err);
    }
};

adminController.logout = async (req, res, next) => {
    try {
        res.clearCookie(process.env.EVENT_ID + "-adminJwt");
        return res.redirect(process.env.ROOT_PATH + 'admin');
    } catch (err) {
        console.log(err);
        return res.redirect(process.env.ROOT_PATH);
    }
};

exports.adminAuth = (req, res, next) => {
    const tokenName = process.env.EVENT_ID + "-adminJwt";
    let token = req.cookies[tokenName];
    if (!token) {
        return res.redirect('/admin');
    }
    try {
        req.payload = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (e) {
        return res.redirect('/admin');
    }
};

// Example route that requires admin authentication
app.get('/admin/dashboard', exports.adminAuth, (req, res) => {
    res.send('Welcome to the admin dashboard!');
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ServerError function
function ServerError(err) {
    console.error(err);
    // You can customize this function to handle errors as needed
    // For example, you might want to send a response to the client
    // res.status(500).send('Internal Server Error');
}
