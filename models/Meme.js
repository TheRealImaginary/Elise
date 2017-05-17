const mongoose = require('mongoose');

const memeSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  uses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Meme', memeSchema);
