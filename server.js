require('dotenv/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const session = require('./routes/session');


app.use(bodyParser.json());
app.use('/', session);

//Connect DB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    }, 
    () => { console.log("Mongo Connected")
    });




app.listen(process.env.PORT, () => {
    console.log('Listening on PORT 5000')
});