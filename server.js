require('dotenv/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const session = require('./routes/session.routes');
const location = require('./routes/location.routes');
const pollPage = require('./routes/pollPage.routes');


app.use(bodyParser.json());
app.use('/', session);
app.use('/', location);
app.use('/', pollPage);

//Connect DB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    }, 
    () => { console.log("Mongo Connected")
    });


app.listen(process.env.PORT, () => {
    console.log('Listening on PORT 3000')
});