const winston = require('winston');
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

tagSchema.methods.use = function use() {
  this.uses += 1;
  this.save()
    .catch((err) => {
      winston.error('[MONGODB]: An Error Occurred Incrementing Count', err);
    });
};

module.exports = mongoose.model('Tag', tagSchema);
