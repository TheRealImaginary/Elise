const { ArgumentType } = require('discord.js-commando');

module.exports = class List extends ArgumentType {
  constructor(client) {
    super(client, 'list');
  }

  validate(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  parse(value) {
    return value.split(',');
  }
};
