const axios = require('axios');
const winston = require('winston');
const Game = require('./game');
const HangmanCollector = require('../HangmanCollector');
const { distinct } = require('../../util/randomizer');

const DICTIONARY_APIKEY = process.env.DICTIONARY_APIKEY;

/**
 * Represents a Hangman Game.
 * @extends Game
 */
module.exports = class Hangman extends Game {
  /**
   * Creates an instance of Hangman.
   * @param {Bot} client - Represents the Bot.
   * @param {Message} message - Represents the Message that triggered the Hangman Game.
   * @param {object} options - Options for the Hangman Game.
   */
  constructor(client, message, options) {
    super(client, message.author);
    /**
     * Represents the word to be guessed.
     * @type {?string}
     */
    this.word = null;
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

    /**
     * Represents the Maximum amount of Wrong Guesses that can be made by a player.
     * @type {number}
     */
    this.wrongGuesses = 10;

    /**
     * Represents the Collector Collecting Message for the Game.
     * @type {HangmanCollector}
     */
    this.hangmanCollector = null;

    this.play(message);
  }

  // TODO Make this look better :(.
  // Sometimes Message.content will hold old info. Investigate !
  // indexOf works for subtrings which is a flaw.
  async play(message) {
    await this.getWord(message);
    if (!this.word || this.word.length === 0) {
      this.endGame();
      return;
    }
    this.guess = this.word.replace(/[a-z]/gi, '_ ').split(' ');
    this.hangmanMessage = await message
      .say(`**__Wrong Guesses__**:\n\`\`\`${this.guess.join(' ')}\t\t\t\t\t Guesses Left: ${this.wrongGuesses}\`\`\``);

    const filter = msg =>
      (this.word.toLowerCase() === msg.content.toLowerCase()
        || this.word.toLowerCase().indexOf(msg.content.toLowerCase()) >= 0);

    this.hangmanCollector = new HangmanCollector(message,
      filter, { wrongGuesses: this.wrongGuesses, maxMatches: distinct(this.word) });

    // When a correct Guess is made by the player.
    this.hangmanCollector.on('collect', async (element) => {
      winston.info(`[HANGMAN]: "${this.word}" Collected: ${element}`);
      if (element.toLowerCase() === this.word.toLowerCase()) {
        return;
      }
      this.guess.push(element);
      const regex = new RegExp(`[^${this.guess.join('')} ]`, 'gi');
      this.hangmanMessage = await this.hangmanMessage
        .edit(`**__Wrong Guesses__**: ${[...this.hangmanCollector.wrong].join(', ')}\n\`\`\`${this.word.replace(regex, '_ ')}\t\t\t\t\t Guesses Left: ${this.wrongGuesses}\`\`\``);
    });

    // When a Wrong Guess is made.
    this.hangmanCollector.on('wrong', async (wrongGuesses) => {
      winston.info(`[HANGMAN]: Wrong Guess on word "${this.word}" ! Guesses Left: ${wrongGuesses}`);
      this.wrongGuesses = wrongGuesses;
      const regex = new RegExp(`[^${this.guess.join('')} ]`, 'gi');
      this.hangmanMessage = await this.hangmanMessage
        .edit(`**__Wrong Guesses__**: ${[...this.hangmanCollector.wrong].join(', ')}\n\`\`\`${this.word.replace(regex, '_ ')}\t\t\t\t\t Guesses Left: ${wrongGuesses}\`\`\``);
    });

    // When Collected Ends.
    this.hangmanCollector.on('end', async (collected, reason) => {
      winston.info(`[HANGMAN]: "${this.word}" Ended with reason "${reason}"`, collected);
      if (reason === 'limit') {
        this.award();
      } else {
        this.hangmanMessage = await this.hangmanMessage.edit(`${this.hangmanMessage.content}\nIncorrect, The Word is "${this.word}"`);
      }
      this.endGame();
    });
  }

  async getWord(message) {
    const { data } = await axios.get('http://api.wordnik.com/v4/words.json/randomWord?', {
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
    winston.info('[HANGMAN]: Random word data', data);
    if (!data || !data.word || data.word.length === 0) {
      message.say('I cannot seem to find anythig right now !');
    } else {
      this.word = data.word.replace(/-/g, ' ');
      winston.info(`[HANGMAN]: Word is "${this.word}"`);
    }
  }

  async award() {
    await this.client.scoreboard.award(this.player.id, 200);
    this.hangmanMessage = await this.hangmanMessage
      .edit(`**__Wrong Guesses__**: ${[...this.hangmanCollector.wrong].join(', ')}
      \n\`\`\`${this.word}\t\t\t\t\t Guesses Left: ${this.wrongGuesses}\`\`\`\nCorrect ! You gained 200 Kittens !`);
  }

  handleError(message, error) {
    this.client.emit('error', error);
    message.say('An Error Occured Fetching Words !');
  }

  endGame() {
    super.endGame();
    if (this.hangmanCollector && !this.hangmanCollector.ended) {
      this.hangmanCollector.stop('Error');
    }
  }
};
