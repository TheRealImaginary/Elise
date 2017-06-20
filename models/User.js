const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  userID: {
    type: String,
    unique: true,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('User', userSchema);
