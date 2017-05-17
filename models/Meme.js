const mongoose = require('mongoose');

const memeSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  addedBy: {
    type: String,
    required: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

memeSchema.methods.use = function use() {
  this.uses += 1;
  this.save()
    .catch((err) => {
      console.log('An Error Occured Incrementing Uses !');
      console.log(err);
    });
};

memeSchema.statics.findAndCount = function findAndCount(options) {
  return new Promise((resolve, reject) => {
    this.count(options.count)
      .exec()
      .then((count) => {
        this.find(options.find)
          .exec()
          .then(memes => resolve([count, memes]))
          .catch(reject);
      }).catch(reject);
  });
};

memeSchema.statics.findThenRemove = function findThenRemove(name, author) {
  return new Promise((resolve, reject) => {
    this.findOne({ name })
      .exec()
      .then((meme) => {
        if (meme) {
          if (author.id === meme.addedBy) {
            this.remove({ name }).then(resolve).catch(reject);
          } else {
            const error = new Error('You are not this Meme creator. Only Meme Creators or Bot Owners can delete Memes !');
            error.name = 'NotCreator';
            reject(error);
          }
        } else {
          const error = new Error(`No Meme exists with name ${name} !`);
          error.name = 'NoExists';
          reject(error);
        }
      }).catch(reject);
  });
};

module.exports = mongoose.model('Meme', memeSchema);
