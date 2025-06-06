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

const VideoRoutes = require('./modules/Video/Video_Gallery.route'); // Import your image routes

const PhotoRoutes = require('./modules/Photo/Photo.route'); // Import your image routes

const FooterRoutes = require('./modules/Footer/Footer.route'); // Import your image routes

const AboutRoutes = require('./modules/About/About.route'); // Import your image routes 




// view engine setup

// Set views directory
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// Serve HTML files directly (no template engine)
app.set('view engine', 'html');

// Route to render HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

//----------------------------------------

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Serve static files (like favicon.ico) from the public folder
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
app.use('/imageSlider', imageSliderRoutes);
app.use('/blog', BlogRoutes);

app.use('/video', VideoRoutes);

app.use('/photo', PhotoRoutes); // Use photo routes

app.use('/footer', FooterRoutes); // Use footer routes

app.use('/about', AboutRoutes); // Use about routes





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


/*
figma : Link 
https://www.figma.com/design/TfJEYxtNSZwiAqQzH4hwUQ/Surat-Gurukul?node-id=0-1&p=f&t=kSnUDWvV5SfKl7L9-0
https://mui.com/store/previews/minimal-dashboard-free/

gajerajenis66@gmail.com
*/