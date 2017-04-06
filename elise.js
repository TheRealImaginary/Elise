const Discord = require('discord.js');
const randomizer = require('./util/randomizer').randomizer;

let config;
try {
	config = require('./config.json');
} catch (err) {
	config = {};
	console.log('Elise Couldn\'t find config.');
}

global.PREFIX = process.env.PREFIX || config.PREFIX;
global.OWNER = process.env.OWNER || config.OWNER;

const commandStuff = require('./commands.js');
const commands = commandStuff.commands;

/*Constants*/
const TOKEN = process.env.TOKEN || config.TOKEN;

const games = ['CSGO', 'StarCraft', 'HotS', 'LotV', 'WoW Level 120', 'LoL', 'With You', 'With Yarn', 'With Webs', 'The Botfather', 'HL3', 'L4D3', 'DOTA 2'];

/*******************************************************/
function setStatus(bot) {
	bot.user.setGame(randomizer(games));
}

let bot = new Discord.Client({
	fetchAllMembers: true
});
bot.isASleep = false;
bot.commandsExecuted = 0;

let started;

bot.on('ready', function () {
	setStatus(bot);
	setInterval(setStatus, 3600000, bot);
	started = new Date();
	console.log("Started Bot log.\nIt's Alive @ %s!", started);
});

bot.on('disconnect', function () {
	console.log('Bot has disconnected!\nProcess Terminated\nUptime DiscordJS : %s | Me : %s\n', bot.uptime, new Date() - started);
});

bot.on('error', function (error) {
	console.log('An Error Occurred');
	console.log('/*************************************/');
	console.log(error);
	console.log('/*************************************/');
});
//TODO : Maybe send a message if asleep?
let messageHandler = function (oldMessage, newMessage) {
	let message = newMessage || oldMessage;
	if (message.author.bot) {
		return;
	}
	if (bot.isASleep && message.content !== '!wakeup') {
		console.log('I am Sleeping!');
		return;
	}
	//For Checking On The Bot
	if (message.content.toLowerCase() == 'ping') {
		console.log('Ping Pong Test!');
		message.channel.sendMessage('Pong').then(function (message) {
			message.edit(`${message.content}\n**This ping took *${new Date() - message.createdAt}* ms | Client heartbeat *${Math.floor(bot.ping)}* ms**.`);
		}).catch(function (err) {
			console.log('Error Occurred when pinging');
			console.log(err);
		});
	} else if (message.content.startsWith(PREFIX)) {
		console.log('Command Detected!');
		var cmd = commands[message.content.split(' ')[0].substring(PREFIX.length)];
		if (cmd) {
			cmd.executor(message, bot, commands);
			bot.commandsExecuted++;
		}
	}
};
bot.on('message', messageHandler);
//TODO : Check if someone editted a command
bot.on('messageUpdate', messageHandler);

bot.on('messageDelete', function (deletedMessage) {
	console.log('Message Deleted %s', deletedMessage);
});

let voiceStateUpdateHandler = function (oldMember, newMember) {
	console.log('Member moving between channels!');
};
bot.on('voiceStateUpdate', voiceStateUpdateHandler);

bot.on('guildCreate', function (guild) {
	console.log('Joined A Guild');
	console.log(guild);
	//console.log(guild.available, guild.defaultChannel);
	if (guild.available) {
		guild.defaultChannel.sendMessage(`Welcome humans, I am here ~~to take over your server~~ so we can have fun together.Use "${PREFIX}help" for a list of availble commands!`);
	}
});

bot.on('guildDelete', function (guild) {
	console.log('Left A Guild!');
	console.log(guild);
});

bot.login(TOKEN);