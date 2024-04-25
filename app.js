var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var submitRouter = require('./routes/submit');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:"Rule Number 5",
    resave: false,
    saveUninitialized:false,
    cookie:{
        maxAge: 6000 * 60
    }
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/submit',submitRouter);

module.exports = app;
