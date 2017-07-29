const Sherlock = require('sherlockjs');
const moment = require('moment');
const { Command } = require('discord.js-commando');

module.exports = class RemindMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      aliases: ['reminder'],
      autoAliases: false,
      group: 'util',
      memberName: 'remindme',
      description: 'Sends a DM reminding a user of something after a specific amount of time',
      args: [{
        key: 'duration',
        prompt: 'When do you want me to remind you ?',
        type: 'string',
        validate(duration) {
          const parsed = Sherlock.parse(duration);
          if (!parsed.startDate || new Date(parsed.startDate) - Date.now() <= 0) {
            return 'I am sorry that was not a valid date format!';
          }
          return true;
        },
        parse(duration) {
          return Sherlock.parse(duration).startDate;
        },
      }, {
        key: 'content',
        prompt: 'What would you like me to remind you of ?',
        default: '',
        type: 'string',
      }],
    });
  }

  run(message, { content, duration }) {
    duration = new Date(duration) - Date.now();
    setTimeout(() => {
      message.author.send(`You asked to be reminded of ${content && content.length > 0 ? content : 'something'
        }`);
    }, duration);
    message.say(`I will remind you in ${moment.duration(duration, 'milliseconds').humanize()}!`);
  }
};
