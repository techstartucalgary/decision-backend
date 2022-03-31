require('dotenv/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));

const session = require('./routes/session.routes');
const location = require('./routes/location.routes');
const pollPage = require('./routes/pollPage.routes');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/', session);
app.use('/', location);
app.use('/', pollPage);

// Connect DB
mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
    }, () => { console.log("Mongo Connected")
});

// Some code to allow verbose logging of DB connection status
let connection = mongoose.connection;

connection.on('connected', () => {
    console.log("DB connected successfully");
})

connection.on('disconnected', () => {
    console.log("DB disconnected successfully");
})

connection.on('error', console.error.bind(console, 'Connection Error: '));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});