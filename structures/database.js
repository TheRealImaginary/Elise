const winston = require('winston');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const DB_URL = process.env.DB_URL;

module.exports = class Database {

  static connect() {
    mongoose.connect(DB_URL)
      .then(() => winston.info('[MONGODB]: Connected to the Database !'))
      .catch((err) => {
        winston.error(`[MONGODB]: An Error Occured connecting to the Database \n${err}!`);
      });
  }
};
