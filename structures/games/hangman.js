const axios = require('axios');
const winston = require('winston');
const { RichEmbed } = require('discord.js');
const Game = require('./game');
const HangmanCollector = require('../HangmanCollector');
const { distinct } = require('../../util/util');

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
     * @type {Array<string>}
     */
    this.guess = [];

    /**
     * Represents the Wrong Guesses made so far.
     * @type {Array<string>}
     */
    this.wrongGuesses = [];

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
     * Represents the Maximum amount of Wrong Attempts that can be made by a player.
     * @type {number}
     */
    this.wrongAttempts = 10;

    /**
     * Represents the Collector Collecting Message for the Game.
     * @type {HangmanCollector}
     */
    this.hangmanCollector = null;

    this.play(message);
  }

  // TODO Make this look better :(.
  // Sometimes Message.content will hold old info. Investigate !
  // This was an example word >> œdema. Make sure this doesnt get fetched.
  async play(message) {
    await this.getWord(message);
    if (!this.word || this.word.length === 0) {
      this.endGame();
      return;
    }

    this.hangmanMessage = await message.embed(this.hangmanEmbed);

    const filter = msg =>
      (this.word.toLowerCase() === msg.content.toLowerCase()
        || (msg.content.length === 1 &&
          this.word.toLowerCase().indexOf(msg.content.toLowerCase()) >= 0));

    this.hangmanCollector = new HangmanCollector(message.channel,
      filter, {
        wrongAttempts: this.wrongAttempts,
        maxMatches: distinct(this.word),
        time: 5 * 60 * 1000,
      });

    // When a correct Guess is made by the player.
    this.hangmanCollector.on('collect', async (element) => {
      winston.info(`[HANGMAN]: "${this.word}" Collected: ${element}`);
      this.guess.push(element);
      if (element.toLowerCase() === this.word.toLowerCase()) {
        return;
      }
      this.hangmanMessage = await this.hangmanMessage
        .edit('', { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
    });

    // When a Wrong Guess is made.
    this.hangmanCollector.on('wrong', async (wrongAttempts, wrongGuess) => {
      winston.info(`[HANGMAN]: Wrong Guess on word "${this.word}" ! Guesses Left: ${wrongAttempts}`);
      this.wrongAttempts = wrongAttempts;
      this.wrongGuesses.push(wrongGuess);
      this.hangmanMessage = await this.hangmanMessage
        .edit('', { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
    });

    // When Collected Ends.
    this.hangmanCollector.on('end', async (reason) => {
      winston.info(`[HANGMAN]: "${this.word}" Ended with reason "${reason}"`);
      if (reason === 'limit') {
        this.award();
      } else if (reason === 'wrong') {
        this.hangmanMessage = await this.hangmanMessage
          .edit(`Incorrect, The Word is "${this.word}"`, { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
      } else if (reason === 'time') {
        this.hangmanMessage = await this.hangmanMessage
          .edit(`Game has ended due to inactivity\nThe word is "${this.word}"!`,
          { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
      } else {
        this.hangmanMessage = await this.hangmanMessage
          .edit(`You Ended the Game\nThe word is "${this.word}"!`, { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
      }
      this.endGame();
    });
  }

  get hangmanEmbed() {
    const alpha = this.guess.length === 0 ? '[a-z]' : `[^${this.guess.join(' ')} ]`;
    const regex = new RegExp(`${alpha}`, 'gi');
    const embed = new RichEmbed();
    embed.setColor('RANDOM');
    embed.setAuthor(this.player.tag, this.player.displayAvatarURL());
    embed.setTitle('Hangman');
    embed.setDescription(`**__Wrong Guesses:__** ${this.wrongGuesses.join(', ')}
    \n**__Guesses Left:__** ${this.wrongAttempts}\n\`\`\`${this.word.replace(regex, '_ ')}\`\`\``);
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  editEmbed(oldEmbed) {
    const alpha = this.guess.length === 0 ? '[a-z]' : `[^${this.guess.join(' ')} ]`;
    const regex = new RegExp(`${alpha}`, 'gi');
    const embed = new RichEmbed(oldEmbed);
    embed.setDescription(`**__Wrong Guesses:__** ${this.wrongGuesses.join(', ')}
    \n**__Guesses Left:__** ${this.wrongAttempts}\n\`\`\`${this.word.replace(regex, '_ ')}\`\`\``);
    return embed;
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
      .edit('Correct ! You gained 200 Kittens !', { embed: this.editEmbed(this.hangmanMessage.embeds[0]) });
  }

  handleError(message, error) {
    this.client.emit('error', error);
    message.say('An Error Occured Fetching Words !');
  }

  endGame() {
    super.endGame();
    if (this.hangmanCollector && !this.hangmanCollector.ended) {
      this.hangmanCollector.stop('user');
      this.hangmanCollector = null;
    }
  }
};
