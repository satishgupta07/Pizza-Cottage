require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)

const app = express()

const PORT = process.env.PORT || 3000


// Database Connection

const {mongoURI} = require("./mongo_config/key");

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology:true});
const connection = mongoose.connection;
connection.once('open', function(){
  console.log('Conection has been made!');
}).on('error', function(error){
    console.log('Error is: ', error);
});


// Session store 
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: 'sessions'
})

// Session config

app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false, 
  store: mongoStore,
  saveUninitialized: false, 
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour 
}))

app.use(flash())

// Assets
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))

app.use(express.json())

// Global middleware 
app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

// Set Template Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})