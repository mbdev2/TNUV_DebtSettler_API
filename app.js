require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var passport = require('passport');
var cors = require('cors');


require('./app_api/models/db');
require('./app_api/konfiguracija/passport');

var indexApi = require('./app_api/routes/index');

var app = express();

// Preusmeritev na HTTPS na Heroku
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`);
    else
      next();
  });
}

// povecane omejitve za slike
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));


app.disable('x-powered-by');
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build'))); //mogoce bo treba odstrant 21.3.1

app.use(passport.initialize());

//Handles robots.txt
app.all('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send("User-agent: *\Allow: /");
});

app.use(cors());
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  next();
});

//app.use('/', indexRouter);
app.use('/api', indexApi);
//app.get(/(\/)|(\/danes)|(\/ekonomija)|(\/izobrazba)|(\/covid)|(\/kultura)|(\/sport)|(\/videoteka)|(\/prijava)|(\/profile)|(\/profile\/uredi)|(\/registracija)|(\/mediainput)|(\/odobritev)|(\/admin)|(\/live)|(\/prikaziVsePriljubljene)|(\/prikaziVseMoje)|(\/article\/[a-z0-9]{24})|(\/rezultatiIskanja\\?iskalniNiz\/[a-z0-9 +-/*&%$#@€]*)/, (req, res, next) => {
//  res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
//});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Obvladovanje napak zaradi avtentikacije
app.use((err, req, res, next) => {
  if (err.name == "UnauthorizedError") {
    res.status(401).json({"sporočilo": err.name + ": " + err.message});
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
