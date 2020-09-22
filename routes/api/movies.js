const express = require('express');
const router = express.Router();
const MoviesService = require('../../services/movies');
const moviesService = new MoviesService();
const passport = require('passport');
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

// JWT Strategies
require('../../utils/auth/strategies/jwt');

//Endpoints
router.get('/', async function(req, res, next) {
  cacheResponse(res, FIVE_MINUTES_IN_SECONDS);

  try {
    const movies = await moviesService.getMovies();

    res.status(200).json({
      data: movies,
      message: 'OK'
    });
  } catch(err) {
    res.status(err.status).json({
      error,
      message: err.message
    });
  }
});

router.get('/:movieId', async function(req, res, next) {
  cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);

  const { movieId } = req.params;

  try {
    const movie = await moviesService.getMovie({ movieId });

    res.status(200).json({
      data: movie,
      message: 'OK'
    });
  } catch(err) {
    next(err);
  }
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validation(createMovieSchema),
  async function(req, res, next) {
    const { body: movie } = req;

    try {
      const createdMovie = await moviesService.createMovie({ movie });

      res.status(201).json({
        data: createdMovie,
        message: 'CREATED'
      });
    } catch(err) {
      next(err);
    }
  }
);

router.put(
  "/:movieId", 
  passport.authenticate('jwt', { session: false }),
  validation(movieIdSchema, 'params'),
  validation(updateMovieSchema),
  async function(req, res, next) {
    const { body: movie } = req;
    const { movieId } = req.params;

    try {
      const updatedMovie = await moviesService.updateMovie({ movieId, movie });

      res.status(200).json({
        data: updatedMovie,
        message: 'OK'
      });
    } catch(err) {
      next(err);
    }
  }
);

router.delete(
  '/:movieId',
  passport.authenticate('jwt', { session: false }),
  validation(movieIdSchema, 'params'),
  async function(req, res, next) {
    console.log(req.params);
    const { movieId } = req.params;

    try {
      const deletedMovie = await moviesService.deleteMovie({ movieId });
      
      res.status(200).json({
        data: deletedMovie,
        message: 'OK'
      });
    } catch(err) {
      next(err);
    }
  }
);

module.exports = router;