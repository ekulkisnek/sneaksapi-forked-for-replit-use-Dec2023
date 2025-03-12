const express = require('express');
const app = express();
const Database = require('@replit/database');
const db = new Database();
require('./routes/sneaks.routes.js')(app, db); // Pass db to routes
require('dotenv').config();
const SneaksAPI = require('./controllers/sneaks.controllers.js');

var port = process.env.PORT || 4000;

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Optional: Restart server or perform cleanup here
});

app.listen(port, function () {
    console.log(`Sneaks API listening on port ${port}`);
});

module.exports = { app, SneaksAPI };
