if (process.env.NODE_ENV == 'production') {
    require('dotenv').config()
}


const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Session = require('./database/models/session');

const morgan = require('morgan')
mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser: true
})


const app = express()
const db = mongoose.connection

db.on('error', error => console.error(error))
db.once('open', () => console.error('Connected to Mongoose'))


const indexRouter = require('./routes/index')
const sessionRouter = require('./routes/session')
const activityRouter = require('./routes/locations')

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))



app.use('/', indexRouter)
app.use('/sessions', sessionRouter)
app.use('/activity', activityRouter)


app.get('/newSession', (req, res) => {
    const session = new Session({
        name: 'Naveed',
        linkID: 'linkid',
        budget: 2,
        activities: ['Drinking', 'Movies'],
    });

    session.save()
        .then((result) => {
            res.headersSent(result)
        })
        .catch((err) => {
            console.log(err);
        })
})








module.exports = {createID};

app.listen(process.env.PORT || 3000)