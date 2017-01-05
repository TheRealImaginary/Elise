"use strict";

/*Constants*/
const RichEmbed = require('discord.js').RichEmbed;
const chrono = require('chrono-node');
const fs = require('fs');
const randomizer = require('./randomizer');
const currencyManager = require('./currencyManager');
const weather = require('./weather');
const getRandomQuotes = require('./quotes');
const currencyManagerInstance = new currencyManager();
const commandPermissions = {
	USER: 0,
	OWNER: 10
};
var config;
try {
	config = require('./config.json');
} catch (err) {
	config = {};
	console.log('Couldn\'t find config.');
	console.log(err);
}

var PREFIX = process.env.prefix || config.PREFIX;
var OWNER = process.env.OWNER || config.OWNER;

//TODO : Library for formating below string(common-tags)
//Add AFK time?
function getServerInfo(guild, bot) {
	if (!guild.available)
		return;
	var channels = guild.channels;
	var voiceChannels = channels.filter(function(el) {
		return el.type == 'voice'
	});
	var textChannels = channels.filter(function(el) {
		return el.type == 'text';
	});
	var embed = new RichEmbed();
	embed.setThumbnail(guild.iconURL);
	embed.setTitle('__**Server Info**__');
	embed.setAuthor(guild.name, guild.iconURL);
	embed.addField('➤Channels',
		`⬧Voice Channels: ${voiceChannels.size}\n⬧Text Channels: ${textChannels.size}`);
	embed.addField('➤Members', `⬧Member Count: ${guild.memberCount}\n⬧Owner: ${guild.owner}`);
	embed.addField('➤Miscellaneous', `⬧Role Count: ${guild.roles.size}\n⬧Created At: ${guild.createdAt}\n⬧Location: ${guild.region}`);
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	embed.setColor('#FF0000');
	return embed;
};

function getMemberInfo(member, bot) {
	if (!member)
		return null;
	var presence = member.user.presence;
	var embed = new RichEmbed();
	embed.setThumbnail(member.user.avatarURL);
	embed.setTitle('__**Member Info**__');
	embed.setAuthor(member.user.username, member.user.avatarURL);
	embed.addField('➤Member', `⬧Nickname: ${member.nickname || 'None'}\n⬧Joined On: ${member.joinedAt}\n⬧Roles: ${member.roles.size}`);
	embed.addField('➤User', `⬧Created On: ${member.user.createdAt}\n⬧Status: ${presence.status}\n⬧Game: ${presence.game || 'None'}\n⬧Intelligent: ${member.user.bot?'Not Yet!':'Yes'}`);
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	embed.setColor('#FF0000');
	return embed;
};

function getWeatherData(statusCode, data, bot) {
	if (statusCode != 200 || !data) {
		return 'Error getting weather data!';
	}
	var embed = new RichEmbed(),
		weather = data.weather[0],
		main = data.main,
		sys = data.sys;
	embed.setTitle('__**Weather Info**__');
	embed.addField('➤Info', `⬧Status: ${weather.main}\n⬧Description: ${weather.description}\n⬧Temperature: ${main.temp} Celsius\n⬧Pressure: ${main.pressure} hPa`);
	embed.addField('➤Miscellaneous', `⬧Country: ${sys.country}\n⬧Sunrise: ${new Date(sys.sunrise * 1000)}\n⬧Sunset: ${new Date(sys.sunset * 1000)}`);
	embed.setColor('#FF0000');
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	return embed;
};

function getBotStatus(bot) {
	var embed = new RichEmbed(),
		uptime = Math.floor(bot.uptime / 1000),
		hours = Math.floor(uptime / 3600),
		minutes = Math.floor((uptime % 3600) / 60),
		seconds = (uptime % 3600) % 60,
		memoryUsed = process.memoryUsage().heapUsed;
	// var os = require('os');
	// console.log(Math.floor(os.freemem()));
	// console.log(Math.floor(os.totalmem()));
	// console.log(os.uptime());
	embed.setThumbnail(bot.user.avatarURL);
	embed.setTitle('__**Bot Status**__');
	embed.addField('➤Uptime', `⬧Hours: ${hours}\n⬧Minutes: ${minutes}\n⬧Seconds: ${seconds}`);
	embed.addField('➤Memory Usage', `⬧Memory Used ${Math.floor(memoryUsed / (1024 * 1024))} MB`);
	embed.setColor('#FF0000');
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	return embed;
};

function checkOwner(message) {
	return message.author.username === OWNER;
};

var commands = {
	help: {
		name: 'Help',
		usage: PREFIX + 'help',
		description: 'Display Available Commands',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			var result = "";
			for (var command in commands) {
				if (!commands[command].hidden)
					result += '**Name :** ' + commands[command].name + ' **Usage :** ' + commands[command].usage + ' **Description :** ' + commands[command].description + '\n';
			}
			return message.channel.sendMessage(result);
		}
	},
	random: {
		name: 'Randomizer',
		usage: PREFIX + 'random <game1,game2,game3>',
		description: 'Use to get a random choice from the given list of games.',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			var game = randomizer(message.content.substring(PREFIX.length + 7));
			if (!game)
				message.channel.sendMessage("You didn't give me anything to choose from :(!");
			else
				message.channel.sendMessage('The Random game is ' + game.trim());
		}
	},
	//TODO : **Is it error proof? **extend to IDs aswell (start from weather file)?
	weather: {
		name: 'Weather',
		usage: PREFIX + 'weather <cityname>',
		description: 'Use to get weather',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message, bot) {
			var cityName = message.content.split(' ')[1];
			if (!cityName || cityName === ' ' || cityName === '') {
				message.channel.sendMessage('Must Provoid me with city');
				return;
			}
			weather(cityName, function(statusCode, data) {
				var result = getWeatherData(statusCode, data, bot);
				// console.log(typeof result);
				// console.log(JSON.stringify(result));
				if (typeof result === 'string')
					message.channel.sendMessage(result);
				else
					message.channel.sendEmbed(result);
			});
		}
	},
	status: {
		name: 'Status',
		usage: PREFIX + 'status',
		description: 'Use to get bot\'s status',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message, bot) {
			console.log(bot.commandsExecuted);
			message.channel.sendEmbed(getBotStatus(bot));
		}
	},
	serverinfo: {
		name: 'Server Info',
		usage: PREFIX + 'serverinfo',
		description: 'Get The Current Server Info',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message, bot) {
			message.channel.sendEmbed(getServerInfo(message.guild, bot));
		}
	},
	//It would only work in GuildChat NOT Private Chat, maybe find a work around ?
	memberinfo: {
		name: 'Member Info',
		usage: PREFIX + 'memberinfo <name>',
		description: 'Get Info about given member',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message, bot) {
			if (!message.guild) {
				message.channel.sendMessage('I am sorry human, This is only availble with channels in a guild.');
				return;
			}
			var name = message.content.substring(PREFIX.length + 11);
			var result = getMemberInfo(message.guild.members.find(el => el.user.username.toLowerCase() === name.toLowerCase()), bot);
			if (result)
				message.channel.sendEmbed(result);
			else
				message.channel.sendMessage('No Such User Or The one who coded me is an idiot!');
		}
	},
	remindMe: {
		name: 'Reminder',
		usage: PREFIX + 'remindMe <time> <context>',
		description: 'Reminds You Of Something',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			var timeAndData = message.content.substring(PREFIX.length + 9).split(' ');
			if (timeAndData.length == 0) {
				message.channel.sendMessage('You must atleast provoid me with time.');
				return;
			}
			var parsed = chrono.parse(timeAndData[0]);
			//console.log(parsed);
			if (!parsed || parsed == [] || !parsed[0].start || parsed[0].start == {}) {
				message.channel.sendMessage('I had trouble understanding that.');
				return;
			}
			var ms = parsed[0].start.date() - new Date(),
				context = timeAndData.slice(1).join(' ') || '';
			message.channel.sendMessage(`I will remind you in ${ms} ms in a DM. Do the math human.`);
			setTimeout(function() {
				if (context == '')
					message.author.sendMessage('You asked to be reminded now of something you never told me!');
				else
					message.author.sendMessage(`You asked to be reminded now of ${context}.`);
			}, ms);
		}
	},
	coinflip: {
		name: 'Coin Flip',
		usage: PREFIX + 'coinflip',
		description: 'Flips A Coin',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			message.channel.sendMessage(`It is ${Math.random() < 0.5?'Heads':'Tails'}`);
		}
	},
	flip: {
		name: 'Flips',
		usage: PREFIX + 'flip',
		description: 'Flips',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			message.channel.sendMessage('(╯°□°）╯︵ ┻━┻');
		}
	},
	unflip: {
		name: 'Un-Flips',
		usage: PREFIX + 'unflip',
		description: 'UnFlips',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			message.channel.sendMessage('┬─┬ ノ( ^_^ノ)');
		}
	},
	dice: {
		name: 'Dice Roll',
		usage: PREFIX + 'dice <faces>',
		description: 'Rolls a nice with \'n\' Faces.',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			var faces = message.content.split(' ')[1];
			if (!faces || faces === ' ')
				faces = 6;
			var die = Math.floor(Math.random() * faces) + 1;
			if (Math.random() < 0.8)
				message.channel.sendMessage(`You rolled ${die}.`);
			else
				message.channel.sendMessage(`The die is cast (No Puns Intended =D), it's ${die}.`);
		}
	},
	quote: {
		name: 'Quote',
		usage: PREFIX + 'quote',
		description: 'Gets a random quote.',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function(message) {
			getRandomQuotes(function(err, statusCode, quote) {
				if (err) {
					message.channel.sendMessage('Error parsing data!');
					//console.log('Error Parsing Quote Data');
					//console.log('Parse Error: %s', err);
					return;
				}
				//console.log(statusCode + ' ' + JSON.stringify(quote));
				if (statusCode !== 200 || !quote)
					message.channel.sendMessage('Error retrieving data.');
				else {
					var quoteObj = quote.forismatic.quote[0];
					message.channel.sendMessage("\"" + quoteObj.quoteText[0] + `\"~${quoteObj.quoteAuthor[0]}`);
				}
			});
		}
	},
	money: {
		name: 'Money',
		usage: PREFIX + 'money',
		description: 'Get Money Amount',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			message.reply(`You have ${currencyManagerInstance.get(message.author)} ${currencyManager.currency_name}`);
		}
	},
	//TODO : Permissions for all hidden commands;If I am not gonna remove it.
	gain: {
		name: 'Gain Currency',
		usage: PREFIX + 'gain',
		description: 'Test Currency',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			var newAmount = currencyManagerInstance.add(message.author, 50);
			message.reply(`You now have ${newAmount} ${currencyManager.currency_name}`);
		}
	},
	spend: {
		name: 'Spend Currency',
		usage: PREFIX + 'spend',
		description: 'Test Currency',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			var response = currencyManagerInstance.spend(message.author, 10);
			if (!response.success)
				message.reply(`
			You don 't have enough ${currencyManager.currency_name}`);
			else
				message.reply(`You now have ${response.amount} ${currencyManager.currency_name}`);
		}
	},
	changeCurrencyName: {
		name: 'Change Currency Name',
		usage: PREFIX + 'changeCurrencyName <name>',
		description: 'Test Currency',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			currencyManager.setName(message.content.substring(19).trim());
		}
	},
	changeCurrencySymbol: {
		name: 'Change Currency Symbol',
		usage: PREFIX + 'changeCurrencySymbol <symbol>',
		description: 'Test Currency',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			currencyManager.setSymbol(message.content.substring(21).trim());
		}
	},
	sleep: {
		name: 'Sleep',
		usage: PREFIX + 'sleep',
		description: 'Bot can get some rest.',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			bot.isASleep = true;
			message.channel.sendMessage('Good Night!');
		}
	},
	wakeup: {
		name: 'Wake Up',
		usage: PREFIX + 'wakeup',
		description: 'Bot wakesup',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			bot.isASleep = false;
			message.channel.sendMessage('I am awake, I am awake!');
		}
	},
	// changeOwner: {
	// 	name: 'Change Owner',
	// 	usage: PREFIX + 'changeOwner <newName>',
	// 	description: 'Changes Owner in config file',
	// 	hidden: true,
	// 	permissions: commandPermissions.OWNER,
	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You cannot do that!');
	// 			return;
	// 		}
	// 		config.owner = message.content.split(' ')[1].trim();
	// 		fs.writeFile('./config.json', JSON.stringify(config), function(err) {
	// 			if (err) {
	// 				config.owner = OWNER;
	// 				//console.log('An Error Occurred Changing Owner!');
	// 				//console.log(err);
	// 				return;
	// 			}
	// 			OWNER = config.owner;
	// 			//console.log('Owner Saved And Changed Successfully!');
	// 			message.channel.sendMessage('Owner Changed Successfully!');
	// 		});
	// 	}
	// },
	//TODO: Need to change prefix in other file(globaly)
	// changePrefix: {
	// 	name: 'Change Prefix',
	// 	usage: PREFIX + 'changePrefix <newPrefix>',
	// 	description: 'Change Prefix in config file',
	// 	hidden: true,
	// 	permissions: commandPermissions.OWNER,
	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You cannot do that!');
	// 			return;
	// 		}
	// 		config.prefix = message.content.split(' ')[1].trim();
	// 		fs.writeFile('./config.json', JSON.stringify(config), function(err) {
	// 			if (err) {
	// 				config.prefix = PREFIX;
	// 				console.log('An Error Occurred Changing Prefix!');
	// 				console.log(err);
	// 				return;
	// 			}
	// 			PREFIX = config.prefix;
	// 			console.log('Prefix Saved And Changed Successfully!');
	// 			message.channel.sendMessage(`Prefix Changed Successfully To ${config.prefix}`);
	// 		});
	// 	}
	// },
	inviteLink: {
		name: 'Invite Link',
		usage: PREFIX + 'invite <permissions>',
		description: 'Sends an invite link',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function(message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You cannot do that!');
				return;
			}
			var permissions = message.content.split(' ').slice(1);
			if (permissions)
				bot.generateInvite(permissions).then(function(invite) {
					//logger.log('Invite Created With Permissions ' + permissions);
					console.log('Invite Created With Permissions ' + (permissions.length == 0 ? 'NO PERMISSIONS' : permissions));
					message.channel.sendMessage(invite);
				}).catch(console.err);
		}
	}
};

module.exports = {
	commands,
	commandPermissions
};