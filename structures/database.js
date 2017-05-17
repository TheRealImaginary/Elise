const mongoose = require('mongoose');

mongoose.Promise = Promise;

const DB_URL = process.env.DB_URL;

module.exports = class Database {

  static connect() {
    mongoose.connect(DB_URL)
      .then(() => console.log('Connected to the Database !'))
      .catch(err => {
        console.log('An Error Occured connecting to the Database !');
        console.log(err);
      });
  }
};
