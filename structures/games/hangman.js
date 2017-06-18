const axios = require('axios');
const Game = require('./game');
const HangmanCollector = require('../HangmanCollector');

const DICTIONARY_APIKEY = process.env.DICTIONARY_APIKEY;

/**
 * Represents a Hangman Game.
 * @extends Game
 */
module.exports = class Hangman extends Game {
  constructor(client, message, options) {
    super(client, message.author);
    /**
     * Represents the word to be guessed.
     * @type {string}
     */
    this.word = '';
    /**
     * Represents the Guessed word so far.
     * @type {Array<Character>}
     */
    this.guess = [];
    /**
     * Represents the Message to be updated with the answer.
     * @type {?Message}
     */
    this.hangmanMessage = null;
    /**
     * Represents the Hangman Options to start the Game with.
     * @type {object}
     */
    this.hangmanOptions = options;

    client.games.set(this.player.id, this);
    this.play(message);
  }

  async play(message) {
    await this.getWord(message);
    if (!this.word || this.word.length === 0) {
      this.endGame();
      return;
    }
    this.guess = this.word.replace(/[a-z]/gi, '_ ').split(' ');
    this.hangmanMessage = await message.say(this.guess.join(' '));
    const filter = msg => msg.author.id === this.player.id && this.word.indexOf(msg.content) >= 0;
    const hangmanCollector = new HangmanCollector(message.channel,
      filter, { wrongGuesses: 3, maxMatches: this.word.length });
    hangmanCollector.on('collect', console.log);
    hangmanCollector.on('end', (collected, reason) => {
      console.log(collected);
      console.log(reason);
      this.endGame();
    });
  }

  async getWord(message) {
    const { data } = await axios.get('http://api.wordnik.com:80/v4/words.json/randomWord?', {
      params: {
        api_key: DICTIONARY_APIKEY,
        hasDictionaryDef: false,
        minCorpusCount: 0,
        maxCorpusCount: -1,
        minDictionaryCount: 1,
        maxDictionaryCount: -1,
        minLength: 5,
        maxLength: -1,
        excludePartOfSpeech: 'proper-noun',
      },
    }).catch(err => this.handleError(message, err));
    console.log(data);
    if (!data || !data.word || data.word.length === 0) {
      message.say('I cannot seem to find anythig right now !');
    } else {
      this.word = data.word.replace(/-/g, ' ');
      console.log(this.word);
    }
  }

  handleError(message, error) {
    this.client.emit('error', error);
    console.log(error.response);
    message.say('An Error Occured Fetching Words !');
  }
};
