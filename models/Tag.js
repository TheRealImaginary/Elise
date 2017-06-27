const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  guildID: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1500, // Discord's Message's Max Length is 2000
  },
  uses: {
    type: Number,
    default: 0,
  },
  relatedTo: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Tag', tagSchema);
