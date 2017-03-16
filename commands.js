/*Constants*/
const RichEmbed = require('discord.js').RichEmbed;
const chrono = require('chrono-node');
const fs = require('fs');
const ytdl = require('ytdl-core');

const random = require('./commands/random.js');
const currencyManager = require('./currencyManager.js');
const weather = require('./commands/weather.js');
const quotes = require('./commands/quotes.js');
const RandomQuote = quotes.RandomQuote;
const TimeQuote = quotes.TimeQuote;
const currencyManagerInstance = new currencyManager();
const commandPermissions = {
	USER: 0,
	ADMIN: 5,
	OWNER: 10
};
var config;
try {
	config = require('./config.json');
} catch (err) {
	config = {};
	console.log('Commands Couldn\'t find config.');
	//console.log(err);
}

var PREFIX = process.env.PREFIX || config.PREFIX;
var OWNER = process.env.OWNER || config.OWNER;
var jailChannel, normalChannel, musicChannel, musicConnection, musicDispatcher;

var Cleverbot = require('cleverbot-node');
Cleverbot.prepare(function () {});
var cleverbot = new Cleverbot();

//TODO : Library for formating below string(common-tags)
//Add AFK time?
function getServerInfo(guild, bot) {
	if (!guild.available)
		return;
	var channels = guild.channels;
	var voiceChannels = channels.filter(function (el) {
		return el.type == 'voice'
	});
	var textChannels = channels.filter(function (el) {
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
	embed.addField('➤User', `⬧Created On: ${member.user.createdAt}\n⬧Status: ${presence.status}\n⬧Game: ${presence.game?presence.game.name:'None'}\n⬧Intelligent: ${member.user.bot?'Not Yet!':'Yes'}`);
	embed.setTimestamp(new Date());
	embed.setFooter(bot.user.username, bot.user.avatarURL);
	embed.setColor('#FF0000');
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

function checkPermissions(message, permission) {
	return message.member.permissions.hasPermission(permission);
};

var commands = {
	help: {
		name: 'Help',
		usage: PREFIX + 'help',
		description: 'Display Available Commands',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message) {
			var result = "";
			for (var command in commands) {
				if (!commands[command].hidden)
					result += '**Name :** ' + commands[command].name + ' **Usage :** ' + commands[command].usage + ' **Description :** ' + commands[command].description + '\n';
			}
			return message.channel.sendMessage(result);
		}
	},
	random: random,
	//TODO : **Is it error proof? **extend to IDs aswell (start from weather file)?
	weather: weather,
	status: {
		name: 'Status',
		usage: PREFIX + 'status',
		description: 'Use to get bot\'s status',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message, bot) {
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
		executor: function (message, bot) {
			message.channel.sendEmbed(getServerInfo(message.guild, bot));
		}
	},
	//It would only work in GuildChat NOT Private Chat, maybe find a work around ?
	//Also Maybe In Private chat it works only for both participants
	memberinfo: {
		name: 'Member Info',
		usage: PREFIX + 'memberinfo <name>',
		description: 'Get Info about given member',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message, bot) {
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
		executor: function (message) {
			var timeAndData = message.content.substring(PREFIX.length + 9).split(' ');
			if (timeAndData.length == 0) {
				message.channel.sendMessage('You must atleast provoid me with time.');
				return;
			}
			var parsed = chrono.parse(timeAndData[0]);
			//console.log(parsed);
			if (!parsed || parsed == [] || !parsed[0] || !parsed[0].start || parsed[0].start == {}) {
				message.channel.sendMessage('I had trouble understanding that.');
				return;
			}
			var ms = parsed[0].start.date() - new Date(),
				context = timeAndData.slice(1).join(' ') || '';
			if (ms < 0) {
				TimeQuote(function (result) {
					message.channel.sendMessage(`${result.quote} ~${result.author}.`);
				});
				return;
			}
			message.channel.sendMessage(`I will remind you in ${ms} ms in a DM. Do the math human.`);
			setTimeout(function () {
				if (context == '')
					message.author.sendMessage('You asked to be reminded now of something you never told me!');
				else
					message.author.sendMessage(`You asked to be reminded now of "${context}".`);
			}, ms);
		}
	},
	coinflip: {
		name: 'Coin Flip',
		usage: PREFIX + 'coinflip',
		description: 'Flips A Coin',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message) {
			message.channel.sendMessage(`It is ${Math.random() < 0.5?'Heads':'Tails'}`);
		}
	},
	flip: {
		name: 'Flips',
		usage: PREFIX + 'flip',
		description: 'Flips',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message) {
			message.channel.sendMessage('(╯°□°）╯︵ ┻━┻');
		}
	},
	unflip: {
		name: 'Un-Flips',
		usage: PREFIX + 'unflip',
		description: 'UnFlips',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message) {
			message.channel.sendMessage('┬─┬ ノ( ^_^ノ)');
		}
	},
	dice: {
		name: 'Dice Roll',
		usage: PREFIX + 'dice <faces>',
		description: 'Rolls a dice with \'n\' Faces.',
		hidden: false,
		permissions: commandPermissions.USER,
		executor: function (message) {
			var faces = message.content.split(' ')[1];
			if (!faces || faces === ' ' || faces <= 0)
				faces = 6;
			var die = Math.floor(Math.random() * faces) + 1;
			message.channel.sendMessage(`You rolled ${die}.`);
		}
	},
	quote: RandomQuote,
	mute: {
		name: 'Mute',
		usage: PREFIX + 'mute <@member>',
		description: 'Mutes A Member',
		hidden: false,
		executor: function (message) {
			if (!checkPermissions(message, 'MUTE_MEMBERS')) {
				message.channel.sendMessage(`You don't have enough juice!`);
				return;
			}
			var user = message.mentions.users.first();
			console.log(user);
			var guild = message.guild;
			if (guild.available) {
				var guildMember = guild.member(user);
				if (!guildMember) {
					message.channel.sendMessage(`Couldn't find a member with that name!`);
					return;
				}
				if (guildMember.selfMute || guildMember.selfDeaf) {
					message.channel.sendMessage(`Member is already muted/deafen.`);
					return;
				}
				guildMember.setMute(true).then(function (member) {
					console.log(`${member.user.username} got muted by ${message.author.username}.`);
				}).catch(console.err);
			} else
				console.log('Guild isnot available for muting a member!');
		}
	},
	unmute: {
		name: 'Unmute',
		usage: PREFIX + 'unmute <@member>',
		description: 'Unmutes A Member',
		hidden: false,
		executor: function (message) {
			if (!checkPermissions(message, 'MUTE_MEMBERS')) {
				message.channel.sendMessage(`You don't have enough juice!`);
				return;
			}
			var user = message.mentions.users.first();
			console.log(user);
			var guild = message.guild;
			if (guild.available) {
				var guildMember = guild.member(user);
				if (!guildMember) {
					message.channel.sendMessage(`Couldn't find a member with that name!`);
					return;
				}
				guildMember.setMute(false).then(function (member) {
					console.log(`${member.user.username} got unmuted by ${message.author.username}.`);
				}).catch(console.err);
			} else
				console.log('Guild isnot available for unmuting a member!');
		}
	},
	// jail: {
	// 	name: 'Jail',
	// 	usage: PREFIX + 'jail <@member>',
	// 	description: 'Jails A Member',
	// 	hidden: false,
	// 	executor: function(message) {
	// 		if (!checkPermissions(message, 'MOVE_MEMBERS')) {
	// 			message.channel.sendMessage(`You don't have enough juice!`);
	// 			return;
	// 		}
	// 		var user = message.mentions.users.first();
	// 		console.log(user);
	// 		var guild = message.guild;
	// 		if (guild.available) {
	// 			var guildMember = guild.member(user);
	// 			if (!guildMember) {
	// 				message.channel.sendMessage(`Couldn't find a member with that name!`);
	// 				return;
	// 			}
	// 			if (!guildMember.voiceChannel) {
	// 				message.channel.sendMessage(`Member isn't in a voice channel.`);
	// 				return;
	// 			}
	// 			if (!normalChannel)
	// 				normalChannel = guildMember.voiceChannel;
	// 			if (!jailChannel) {
	// 				var voiceChannels = guild.channels;
	// 				for (var [key, val] of voiceChannels) {
	// 					if (val.name.toLowerCase() === 'jail') {
	// 						jailChannel = val;
	// 						break;
	// 					}
	// 				}
	// 				if (!jailChannel) {
	// 					message.channel.sendMessage(`I can't find Jail.`);
	// 					return;
	// 				}
	// 			}
	// 			guildMember.setVoiceChannel(jailChannel);
	// 		} else
	// 			console.log('Guild isnot available for jailing a member!');
	// 	}
	// },
	free: {
		name: 'Free',
		usage: PREFIX + 'free <@member>',
		description: 'Frees someone from jail',
		hidden: false,
		executor(message) {
			if (!checkPermissions(message, 'MANAGE_ROLES_OR_PERMISSIONS') && !checkOwner(message)) {
				message.channel.sendMessage(`You don't have enough juice!`);
				return;
			}
			let user = message.mentions.users.first();
			console.log(user);
			let guild = message.guild;
			if (guild.available) {
				let guildMember = guild.member(user);
				if (!guildMember) {
					message.channel.sendMessage(`Couldn't find a member with that name!`);
					return;
				}
				for (let [key, val] of guild.roles) {
					console.log(val.name);
					if (val.name.toLowerCase() == 'inmate')
						guildMember.removeRole(val);
				}
				// if (!guildMember.voiceChannel) {
				// 	message.channel.sendMessage(`Member isn't in a voice channel.`);
				// 	return;
				// }
				// if (guildMember.voiceChannel.name.toLowerCase() !== 'jail') {
				// 	message.channel.sendMessage(`Member isn't in jail.`);
				// 	return;
				// }
				// guildMember.setVoiceChannel(normalChannel);
			} else
				console.log('Guild isnot available for free-ing a member!');
		}
	},
	//Uses cleverbot API <3
	chat: {
		name: 'Chat with me',
		usage: PREFIX + 'chat <message>',
		description: 'Want to play the imitation game?!',
		hidden: false,
		executor: function (message) {
			var content = message.content.split(' ').slice(1);
			console.log(content);
			cleverbot.write(content, function (response) {
				console.log(response);
				if (!response.message || response.message === '') {
					console.log(`Cleverbot didn't respond`);
					return;
				}
				message.channel.sendMessage(response.message);
			});
		}
	},
	juice: {
		name: 'Juice',
		usage: PREFIX + 'juice',
		description: 'Trolls the user',
		hidden: true,
		executor: function (message) {
			message.channel.sendMessage(`You don't have enough juice to get juice!`);
		}
	},
	money: {
		name: 'Money',
		usage: PREFIX + 'money',
		description: 'Get Money Amount',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function (message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
				return;
			}
			var response = currencyManagerInstance.spend(message.author, 10);
			if (!response.success)
				message.reply(`You don't have enough ${currencyManager.currency_name}`);
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
		executor: function (message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
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
		executor: function (message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
				return;
			}
			var permissions = message.content.split(' ').slice(1);
			if (permissions)
				console.log(permissions);
			bot.generateInvite(permissions).then(function (invite) {
				//logger.log('Invite Created With Permissions ' + permissions);
				console.log('Invite Created With Permissions ' + (permissions.length == 0 ? 'NO PERMISSIONS' : permissions));
				message.channel.sendMessage(invite);
			}).catch(console.err);
		}
	},
	resetNickname: {
		name: 'Reset Nick',
		usage: PREFIX + 'resetNick',
		description: 'Resets Bot\'s Nickname',
		hidden: true,
		permissions: commandPermissions.OWNER,
		executor: function (message, bot) {
			if (!checkOwner(message)) {
				message.channel.sendMessage('You don\'t have enough juice!');
				return;
			}
			var guilds = bot.guilds;
			for (var [key, val] of guilds)
				if (val == 'Ali\'s Room') {
					console.log('Found it!');
					var members = val.members;
					for (var [k, v] of members)
						if (v.user.username == bot.user.username) {
							v.setNickname('Elise');
							return;
						}
					console.log('Couldn\'t Find myself!');
				}
		}
	},
	// testMusic: {
	// 	name: 'Test Music',
	// 	usage: PREFIX + 'testMusic',
	// 	description: 'For Testing Music',
	// 	hidden: true,
	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You don\'t have enough juice!');
	// 			return;
	// 		}
	// 		var member = message.member;
	// 		if (!member) {
	// 			message.channel.sendMessage('Works Only in guild!');
	// 			return;
	// 		}
	// 		musicChannel = member.voiceChannel;
	// 		if (!musicChannel) {
	// 			message.channel.sendMessage('You Must be in a voice channel to use this.');
	// 			return;
	// 		}
	// 		if (!musicChannel.joinable) {
	// 			message.channel.sendMessage('You Must be in a joinable voice channel to use this.');
	// 			return;
	// 		}
	// 		var stored = message.content.split(' ')[1] == null;
	// 		musicChannel.join().then(function(connection) {
	// 			musicConnection = connection;
	// 			if (stored) {
	// 				var stream = ytdl('https://www.youtube.com/watch?v=6Yr_gDLcX7Q', {
	// 					quality: 'lowest',
	// 					filter: 'audioonly'
	// 				});
	// 				musicDispatcher = connection.playStream(stream);
	// 			} else {
	// 				musicDispatcher = connection.playFile('./Billie Eilish - Ocean Eyes.mp3');
	// 			}
	// 		}).catch(console.log);
	// 	}
	// },
	// //TODO : handle corner cases
	// testPause: {
	// 	name: 'Test Pause',
	// 	usage: PREFIX + 'testPause',
	// 	description: 'For Testing Pause',
	// 	hidden: true,
	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You don\'t have enough juice.');
	// 			return;
	// 		}
	// 		if (musicDispatcher)
	// 			musicDispatcher.pause();
	// 	}
	// },
	// testResume: {
	// 	name: 'Test Resume',
	// 	usage: PREFIX + 'testResume',
	// 	description: 'For Testing Resume',
	// 	hidden: true,
	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You don\'t have enough juice.');
	// 			return;
	// 		}
	// 		if (musicDispatcher && musicDispatcher.paused)
	// 			musicDispatcher.resume();
	// 	}
	// },
	// testEnd: {
	// 	name: 'Test End',
	// 	usage: PREFIX + 'testEnd',
	// 	description: 'For Testing End',
	// 	hidden: true,

	// 	executor: function(message) {
	// 		if (!checkOwner(message)) {
	// 			message.channel.sendMessage('You don\'t have enough juice.');
	// 			return;
	// 		}
	// 		if (musicDispatcher) {
	// 			musicDispatcher.end();
	// 			musicConnection.disconnect();
	// 			musicChannel.leave();
	// 		}
	// 	}
	// },
};

module.exports = {
	commands,
	commandPermissions
};