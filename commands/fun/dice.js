const { Command } = require('discord.js-commando');
const { getRandom } = require('../../util/Util');

module.exports = class Flip extends Command {
  constructor(client) {
    super(client, {
      name: 'dice',
      aliases: ['roll', 'roll-dice'],
      autoAliases: false,
      group: 'fun',
      memberName: 'dice',
      description: 'Throws a 6 or N-Faced Dice!',
      args: [{
        key: 'faces',
        prompt: 'How Many Faces would you like your dice to be ?',
        type: 'integer',
        default: 6,
        validator(faces) {
          const number = parseInt(faces, 10);
          return !isNaN(number) && number > 1;
        },
      }],
    });
  }

  run(message, { faces }) {
    message.say(`You rolled ${getRandom(1, faces)}`);
  }
};
