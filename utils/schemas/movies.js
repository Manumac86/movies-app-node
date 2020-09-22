const Joi = require('joi');

const movieIdSchema = Joi.object({ movieId: Joi.string().regex(/^[0-9a-fA-F]{24}$/) });
const releasedOnSchema = Joi.string().regex(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/);
const yearSchema = Joi.string().regex(/^(19|20)\d\d$/);

const createMovieSchema = Joi.object({
  director: Joi.string()
    .max(50)
    .required(),
  genre: Joi.string()
    .max(50)
    .required(),
  image_url: Joi.string()
    .uri()
    .required(),
  plot: Joi.string()
    .max(350)
    .required(),
  rated: Joi.string()
    .max(10)
    .required(),
  rating: Joi.number()
    .integer()
    .min(0)
    .max(5)
    .required(),
  released_on: releasedOnSchema
    .required(),
  title: Joi.string()
    .max(50)
    .required(),
  year: yearSchema
    .required(),
});

const updateMovieSchema = Joi.object({
  _method: 'put',
  director: Joi.string()
    .max(50),
  genre: Joi.string()
    .max(50),
  image_url: Joi.string()
    .uri(),
  plot: Joi.string()
    .max(350),
  rated: Joi.string()
    .max(10),
  rating: Joi.number()
    .integer()
    .min(0)
    .max(5),
  released_on: releasedOnSchema,
  historyRatings: Joi.array(),
  title: Joi.string()
    .max(50),
  year: yearSchema,
});

module.exports = {
  movieIdSchema,
  createMovieSchema,
  updateMovieSchema
}