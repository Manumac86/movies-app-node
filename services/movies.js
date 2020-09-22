const MongoLib = require('../lib/mongo');
const moviesMocks = require('../utils/mocks/movies');

class MoviesService {
  constructor() {
    this.collection = 'movies';
    this.mongoDB = new MongoLib();
  }

  async getMovies() {
    const movies = await this.mongoDB.getAll(this.collection);

    return movies || [];
  }

  async getMovie({ movieId }) {
    const movie = await this.mongoDB.get(this.collection, movieId);
    return movie || {};
  }

  async createMovie({ movie }) {
    movie.historyRatings = [];
    movie.historyRatings.push(movie.rating);
    movie.created_at = new Date();
    movie.updated_at = new Date();

    const createdMovieId = await this.mongoDB.create(this.collection, movie);

    return createdMovieId;
  }

  async updateMovie({ movieId, movie }) {
    const historyRatings = [];
    movie.historyRatings.forEach(ratingString => {
      historyRatings.push(parseInt(ratingString, 10));
    });
    if (movie.rating) {
      historyRatings.push(parseInt(movie.rating, 10));
    } 
    const totalRating = historyRatings.reduce((accumulator, currentValue) => accumulator + currentValue);
    const overallRating = ( totalRating / historyRatings.length );
    console.log(totalRating);
    console.log(movie.historyRatings.length);
    console.log(overallRating);
    movie.rating = overallRating;
    movie.historyRatings = historyRatings;

    const updatedMovieId = await this.mongoDB.update(
      this.collection,
      movieId,
      movie
    );

    return updatedMovieId;
  }

  async deleteMovie({ movieId }) {
    const deletedMovieId = await this.mongoDB.delete(
      this.collection,
      movieId
    );
    
    return deletedMovieId;
  }
}

module.exports = MoviesService;