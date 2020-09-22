const express = require('express');
const { config } = require('./config/index');
const bodyParser = require('body-parser');
const boom = require('@hapi/boom');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const moviesRouter = require('./routes/views/movies');
const moviesApiRouter = require('./routes/api/movies');
const MoviesService = require('./services/movies');
const authApiRouter = require('./routes/api/auth');
const {
  logErrors,
  clientErrorHandler,
  errorHandler
} = require('./utils/middlewares/errorHandlers');

// JWT Strategies
require('./utils/auth/strategies/jwt');
require('./utils/auth/strategies/basic');

const moviesService = new MoviesService();

const isRequestAjaxOrApi = require('./utils/isRequestAjaxOrApi');
// App
const app = express();

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Memory unleaked
app.set('trust proxy', 1);

// Use session to persist user session
app.use(session({
  secret: config.authJwtSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

// Routes
app.use('/movies', moviesRouter);
app.use('/api/movies', moviesApiRouter);
app.use('/api/auth', authApiRouter);

// Home Route
app.get('/', async function(req, res, next) {
  const { user } = req;
  try {
    const movies = await moviesService.getMovies();
    res.render('home', { movies, user });
  } catch(err) {
    next(err);
  }
});

app.get('/login', function(req, res, next) {
  const { user } = req;
  if (user) {
    res.redirect('/');
  }
  res.render('login');
});

app.get('/logout', function(req, res, next) {
  req.logOut()
  res.redirect('/login');
});

app.post(
  '/login',
  passport.authenticate('basic', { 
    failureRedirect: '/login',
    successRedirect: '/movies'
  })
);

app.use(function(req, res, next) {
   if (isRequestAjaxOrApi(req)) {
    const {
      output: { statusCode, payload }
    } = boom.notFound();

    res.status(statusCode).json(payload);
  }

  res.status(404).render('404');
})

// Error Handlers
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Server
const server = app.listen(8000, function() {
  console.log(`Listening https://localhost:${server.address().port}`);
});

