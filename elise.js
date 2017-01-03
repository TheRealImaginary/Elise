"use strict";

const Discord = require('discord.js');
const fs = require('fs');
//const config = require('./config.json');
const commandStuff = require('./commands.js');
const commandPermissions = commandStuff.commandPermissions;
const commands = commandStuff.commands;

/*Constants*/
const TOKEN = process.env.TOKEN;
// const LOG_FILE = config.log_file;
// const GENERAL_CHANNEL_NAME = config.general_channel_name;
const PREFIX = process.env.PREFIX;

// const console = new console.Console(fs.createWriteStream(LOG_FILE));

/*******************************************************/

//TODO : {reconnect:true}
const bot = new Discord.Client({
	fetchAllMembers: true
});
bot.isASleep = false;

var started;

bot.on('ready', function() {
	started = new Date();
	console.log("Started Bot log.\nIt's Alive @ %s!", started);
	console.log("Started Bot log.\nIt's Alive @ %s!\n", started);
});

bot.on('disconnect', function() {
	console.log('Bot has disconnected!\nProcess Terminated\nUptime DiscordJS : %s | Me : %s\n', bot.uptime, new Date() - started);
	console.log('Bot has disconnected!\nProcess Terminated\nUptime DiscordJS : %s | Me : %s\n', bot.uptime, new Date() - started);
});

bot.on('error', function(error) {
	console.log('An Error Occurred');
	console.log('/*************************************/');
	console.log(error);
	console.log('/*************************************/');
});
//TODO : Maybe print a message if asleep?
var messageHandler = function(message) {
	if (message.author.bot) {
		return;
	}
	if (bot.isASleep && message.content !== '!wakeup') {
		console.log('I am Sleeping!');
		return;
	}
	//For Checking On The Bot
	if (message.content.toLowerCase() == 'ping') {
		//console.log('Ping Pong Test!');
		console.log('Ping Pong Test!');
		message.channel.sendMessage('Pong').then(function(message) {
			message.edit(`${message.content}\n**This ping took *${new Date() - message.createdAt}* ms | Client heartbeat *${Math.floor(bot.ping)}* ms**.`);
		}).catch(function(err) {
			console.log('Error Occurred when pinging');
			console.log(err);
		});
	} else if (message.content.startsWith(PREFIX)) {
		//console.log('Command Detected');
		console.log('Command Detected!');
		var cmd = commands[message.content.split(' ')[0].substring(PREFIX.length)];
		if (cmd)
			cmd.executor(message, bot);
		//console.log(commands[message.content.split(' ')[0].substring(1)]);
	}
};
bot.on('message', messageHandler);
//TODO : Check if someone editted a command
bot.on('messageUpdate', function(oldMessage, newMessage) {
	if (oldMessage.author.bot)
		return;
	console.log('Message Update From Old : %s \nNew : %s\n', oldMessage, newMessage);
	newMessage.channel.sendMessage('Someone is smart enough to edit a message instead of re-writing it :)');
});

bot.on('messageDelete', function(deletedMessage) {
	console.log('Message Deleted %s', deletedMessage);
});

//TODO : Change Logic To Prison, Current is for testing
var voiceStateUpdateHandler = function(oldMember, newMember) {
	console.log('Member moving between channels!');
};
bot.on('voiceStateUpdate', voiceStateUpdateHandler);

bot.on('guildCreate', function(guild) {
	console.log('Joined A Guild');
	console.log(guild);
	if (guild.availble) {
		guild.defaultChannel.sendMessage('Welcome humans, I am here ~~to take over your server~~ so we can have fun together.Send \"!help\" for a list of availble commands!');
	}
});

bot.login(TOKEN);