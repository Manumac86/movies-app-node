const express = require('express');
const router = express.Router();
const MoviesService = require('../../services/movies');
const moviesService = new MoviesService();
const { config } = require('../../config/index');
const validation = require('../../utils/middlewares/validationHandler');
const cacheResponse = require('../../utils/cacheResponse');
const { 
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS
} = require('../../utils/time');
const {
  movieIdSchema,
  createMovieSchema,
  updateMovieSchema
} = require('../../utils/schemas/movies');

router.get(
  '/',
  async function(req, res, next) {
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    const { user } = req;
    try {
      const movies = await moviesService.getMovies();
      res.render('movies', { movies, user, dev: config.dev });
    } catch(err) {
      next(err);
    }
  }
);

router.get('/:movieId', validation(movieIdSchema, 'params'), async function(req, res, next) {
  cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);

  const { movieId } = req.params;
  const { user } = req;

  try {
    const movie = await moviesService.getMovie({ movieId });
    res.render('movie', { movie, user, dev: config.dev });
  } catch(err) {
    res.render('404', { dev: config.dev });
    next(err);
  }
});

router.post('/:movieId', validation(movieIdSchema, 'params'), validation(updateMovieSchema), async function(req, res, next) {
  const { movieId } = req.params;
  const { body: movie } = req;

  try {
    const updatedMovie = await moviesService.updateMovie({ movieId, movie });

    res.redirect('/movies');
  } catch(err) {
    next(err);
  }
});

router.get('/:movieId/edit', validation(movieIdSchema, 'params'), async function(req, res, next) {
  const { movieId } = req.params;
  const { user } = req;

  try {
    const movie = await moviesService.getMovie({ movieId });
    res.render('addOrEdit', { movie, user, dev: config.dev });
  } catch(err) {
    next(err);
  }
});

router.get('/:movieId/delete', validation(movieIdSchema, 'params'), async function(req, res, next) {
  const { movieId } = req.params;

  try {
    const deletedMovie = await moviesService.deleteMovie({ movieId });
    res.redirect('/movies');
  } catch(err) {
    next(err);
  }
});

router.get('/create/new', function(req, res) {
  const { user } = req;
  console.log(user)
  if (user) {
    res.render('addOrEdit', { user, dev: config.dev });
  } else {
    res.render('unauthorized', { dev: config.dev });
  }
});

router.post('/create/new', validation(createMovieSchema), async function(req, res, next) {
  const { body: movie } = req;
  const { user } = req;
  if (user) {
    try {
      const createdMovie = await moviesService.createMovie({ movie });
      const movies = await moviesService.getMovies();
      res.redirect('/movies');
    } catch(err) {
      next(err);
    }
  } else {
    res.redirect('/login')
  }
});

module.exports = router;
