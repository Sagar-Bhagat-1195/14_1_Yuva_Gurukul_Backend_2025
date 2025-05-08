const cors = require('cors'); // Ensure you also require 'cors'
var express = require('express');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
require("dotenv").config(); //npm install dotenv
require("./db/conn");

var app = express(); // Initialize app at the top

// Increase payload size limit to 10MB (or as required)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(cors());
app.use(express.json());



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const UserRoutes = require('./modules/user/user.route');
const RoleRoutes = require('./modules/role/role.route');
const EmailRoutes = require('./modules/Email/Email.route');
const MailOtpRoutes = require('./modules/MailOtp/MailOtp.route');

const UserGlobalEventRoutes = require('./modules/UserGlobalEvent/UserGlobalEvent.route');
const UserTicketRoutes = require('./modules/UserTicket/UserTicket.route');

const GmailTicketSendRoutes = require('./modules/GmailTicketSend/GmailTicketSend.route');

const imageSliderRoutes = require('./modules/imageSlider/imageSlider.route'); // Import your image routes

const BlogRoutes = require('./modules/Blog/blog.route'); // Import your image routes



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/email', EmailRoutes);

app.use('/user', UserRoutes);
app.use('/role', RoleRoutes);

app.use('/mailotp', MailOtpRoutes);

app.use('/globalevent', UserGlobalEventRoutes);
app.use('/userticket', UserTicketRoutes);

app.use('/gmailticketsend', GmailTicketSendRoutes);
// Use image routes
app.use('/imageSlider', imageSliderRoutes); // This line is commented out
app.use('/blog', BlogRoutes); // This line is commented out






// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
