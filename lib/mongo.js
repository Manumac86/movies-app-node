const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config');

const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const DB_NAME = config.dbName;

const MONGO_URI  =  `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}/${DB_NAME}?retryWrites=true&w=majority` // prettier-ignore

class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    this.dbName = DB_NAME;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.connect(error => {
        if(error) {
          reject(error);
        }

        console.log('Connected successfully to mongo');

        resolve(this.client.db(this.dbName));
      })
    })
  }

  getAll(collection, query) {
    return this.connect()
    .then(db => {
      return db
        .collection(collection)
        .find(query)
        .sort({ rating: 1, released_on: 1 })
        .toArray();
    });
  }

  get(collection, id) {
    return this.connect()
    .then(db => {
      return db
        .collection(collection)
        .findOne({ _id: ObjectId(id) });
    });
  }

  create(collection, data) {
    return this.connect()
    .then(db => {
      return db
        .collection(collection)
        .insertOne(data);
    })
    .then(result => result.insertedId);
  }

  update(collection, id, data) {
    return this.connect()
    .then(db => {
      return db
        .collection(collection)
        .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
    })
    .then(result => result.upsertedId || id);
  }

  delete(collection, id) {
    return this.connect()
    .then(db => {
      return db
        .collection(collection)
        .deleteOne({ _id: ObjectId(id) });
    })
    .then(() => id);
  }
}

module.exports = MongoLib;