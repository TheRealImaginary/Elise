const axios = require('axios');
const htmlToText = require('html-to-text');
const { Command } = require('discord.js-commando');

module.exports = class Quote extends Command {
  constructor(client) {
    super(client, {
      name: 'quote',
      aliases: [],
      autoAliases: false,
      group: 'util',
      memberName: 'quote',
      description: 'Displays a random quote',
      throttling: {
        usages: 2,
        duration: 5,
      },
    });
  }

  async run(message) {
    let quote;
    try {
      quote = await this.getQuote();
      const content = htmlToText.fromString(quote.content);
      message.say(`"${content}" ~${quote.title}`);
    } catch (err) {
      message.say('An Error Occured Fetching a Quote! :(');
    }
  }

  getQuote() {
    return new Promise((resolve, reject) => {
      axios.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1')
        .then(res => resolve(res.data[0]))
        .catch(reject);
    });
  }
};
