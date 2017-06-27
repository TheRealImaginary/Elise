const winston = require('winston');
const he = require('he');
const { RichEmbed } = require('discord.js');
const { shuffle, capitalize, getTrivia } = require('../../util/util');
const Game = require('./game');

const triviaTime = 15;
const numbers = ['1', '2', '3', '4'];
const score = 10;

/**
 * Represents a Trivia Game being played by multiple Users.
 * @extends Game
 */
module.exports = class MultiplayerTrivia extends Game {
  /**
   * Creates an instance of MultiplayerTrivia.
   * @param {any} client - Represents the Bot.
   * @param {Message} message - Represents the Message that triggered the Trivia Game.
   * @param {any} options - The Options for the Trivia Game.
   */
  constructor(client, message, options) {
    super(client, message.author);

    /**
     * The Users in the Game.
     * @type {Array<{player: User, score: number>}
     */
    this.players = [{ player: this.player, score: 0 }];

    /**
     * Trivia Data.
     * @type {Array<object>}
     */
    this.trivia = null;

    /**
     * Current Question.
     * @type {number}
     */
    this.currentQuestion = 0;

    /**
     * Trivia Options used by the Trivia Game.
     * @type {object}
     */
    this.triviaOptions = options;

    /**
     * Cached answers.
     */
    this._answers = null;

    /**
     * The Guild the game was triggered in.
     * @type {Guild}
     */
    this.guild = message.guild;

    this.client.guildGames.set(message.guild.id, this);
  }

  /**
   * Registers the Player in the Game.
   * @param {User} player - A User joining the Game.
   */
  join(player) {
    this.players.push({ player, score: 0 });
    this.client.games.set(player.id, this);
  }

  async play(message) {
    this.trivia = await this.getTrivia(message);
    if (!this.trivia) {
      this.endGame();
      return;
    }
    let responded = [];
    const filter = (msg) => {
      if (this.players.findIndex(p => p.player.id === msg.author.id) >= 0
        && numbers.includes(msg.content.trim())) {
        if (!responded.includes(msg.author.id)) {
          responded.push(msg.author.id);
          return true;
        }
      }
      return false;
    };

    /* eslint-disable no-await-in-loop */
    while (this.currentQuestion < this.trivia.length) {
      await message.embed(this.triviaEmbed);
      let guesses;
      try {
        guesses = await message.channel.awaitMessages(filter,
          { max: this.players.length, time: triviaTime * 1000, errors: ['time'] });
        const { resultMessage, scores } = this.getCorrectPlayersAndScores(guesses);
        message.say(resultMessage, { embed: scores });
      } catch (collected) {
        const { resultMessage, scores } = this.getCorrectPlayersAndScores(guesses);
        message.say(`Time is up ! ${resultMessage}`, { embed: scores });
      }
      responded = [];
    }
    /* eslint-enable no-await-in-loop */
  }

  /**
   * Represents the Trivia Question/Answers as an Embed Message.
   * @readonly
   */
  get triviaEmbed() {
    const { category, type, difficulty, question } = this.trivia[this.currentQuestion];
    const answers = this.answers;
    const embed = new RichEmbed();
    embed.setColor('RANDOM');
    embed.setAuthor(`Info: ${category} | ${capitalize(type)} | ${capitalize(difficulty)}`);
    embed.setTitle(`You have **${triviaTime} seconds** to answer !`);
    embed.addField('➤Question', `⬧${he.decode(question)}`);
    embed.addField('➤Answers', answers.join('\n'));
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  /**
   * Returns the answered shuffled and indexed.
   * @readonly
   */
  get answers() {
    if (this._answers) {
      return this._answers;
    }
    const { correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswers } = this.trivia[this.currentQuestion];
    const answers = [].concat(incorrectAnswers);
    answers.push(correctAnswer);
    shuffle(answers);
    this._answers = answers.map((answer, index) => `${index + 1}. ${he.decode(answer)}`);
    return this._answers;
  }

  async getTrivia(message) {
    const { data } = await getTrivia(this.triviaOptions)
      .catch(err => this.handleError(message, err));
    if (!data || !data.results || data.results.length < this.triviaOptions.amount) {
      winston.info('[TRIVIA]: No Questions Found', this.triviaOptions);
      message.say('No Questions in this Category !');
      return null;
    }
    winston.info('[TRIVIA]: Trivia data ', data.results);
    return data.results;
  }

  /**
   * Filters Correct Players and Returns a Message and Scores accordingly.
   * @param {Collection<Snowflake, Message>} guesses - The Player guesses for the Question.
   * @returns {{msg: string, ?scores: RichEmbed}} Message and Scores.
   */
  getCorrectPlayersAndScores(guesses) {
    const correctAnswer = this.trivia.correct_answer;
    const correctIndexFilter = answer => answer.split('. ')[1] === correctAnswer;
    const answers = this.answers;
    const correctIndex = answers.findIndex(correctIndexFilter);
    const isCorrect = msg => parseInt(msg.content.trim(), 10) - 1 === correctIndex;
    const correctPlayers = guesses.array().filter(isCorrect).map(msg => msg.author);
    console.log(correctAnswer);
    if (correctPlayers.length === 0) {
      return {
        msg: `No one got the correct answer !\nCorrect answer is ${correctAnswer}.`,
        scores: null,
      };
    } else if (correctPlayers.length === 1) {
      return {
        msg: `${correctPlayers[0].tag} is correct !`,
        scores: this.getScores(correctPlayers),
      };
    }
    return {
      msg: `${correctPlayers.map(user => user.tag).join(', ')} are correct !`,
      scores: this.getScores(correctPlayers),
    };
  }

  /**
   * Computes players' scores and returns it.
   * @param {Array<User>} correctPlayers - Users that got correct answers.
   * @returns {RichEmbed} The Scores in a RichEmbed.
   */
  getScores(correctPlayers) {
    console.log(this.players);
    this.players.forEach((p) => {
      const index = correctPlayers.findIndex(player => player.id === p.player.id);
      if (index >= 0) {
        p.score += score - index;
      }
    });
    console.log(this.players);
    const playerScores = this.players.map((p) => {
      const index = correctPlayers.findIndex(player => player.id === p.player.id);
      if (index >= 0) {
        if (index === 0) {
          return `**${index + 1}. ${p.player.tag} - ${p.score} Kittens (+${score - index})**`;
        }
        return `${index + 1}. ${p.player.tag} - ${p.score} Kittens (+${score - index})`;
      }
      return `${index + 1}. ${p.player.tag} - ${p.score} Kittens (+0)`;
    });
    const embed = new RichEmbed();
    embed.setColor('RANDOM');
    embed.setAuthor('Trivia Scores');
    embed.setTitle(`Round ${this.currentQuestion + 1} / ${this.triviaOptions.amount}`);
    embed.setDescription(playerScores.join('\n'));
    embed.setTimestamp(new Date());
    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL);
    return embed;
  }

  handleError(message, err) {
    this.client.emit('error', err);
    message.say('An Error Occured Fetching Trivia Question !');
  }

  endGame() {
    this.players.forEach(p => this.client.games.delete(p.player.id));
    this.client.guildGames.delete(this.guild.id);
  }
};
