/*Constants*/
const help = require('./commands/help');
const random = require('./commands/random');
const status = require('./commands/status');
const serverinfo = require('./commands/serverinfo');
const memberinfo = require('./commands/memberinfo');
const weather = require('./commands/weather');
const remindMe = require('./commands/remindMe');
const coinFlip = require('./commands/coin');
const flip = require('./commands/flip');
const unflip = require('./commands/unflip');
const dice = require('./commands/dice');
const mute = require('./commands/mute');
const unmute = require('./commands/unmute');
const free = require('./commands/free');
const juice = require('./commands/juice');
const sleep = require('./commands/sleep');
const wakeup = require('./commands/wakeup');
const inviteLink = require('./commands/inviteLink');
const nickName = require('./commands/nickName');
const quotes = require('./commands/quotes');
const RandomQuote = quotes.RandomQuote;
const TimeQuote = quotes.TimeQuote;

let config;
try {
	config = require('./config.json');
} catch (err) {
	config = {};
	console.log('Commands Couldn\'t find config.');
	//console.log(err);
}

var jailChannel, normalChannel, musicChannel, musicConnection, musicDispatcher;

let commands = {
	help: help,
	random: random,
	//TODO : **Is it error proof? **extend to IDs aswell (start from weather file)?
	weather: weather,
	status: status,
	serverinfo: serverinfo,
	//It would only work in GuildChat NOT Private Chat, maybe find a work around ?
	//Also Maybe In Private chat it works only for both participants
	memberinfo: memberinfo,
	remindMe: remindMe,
	coinflip: coinFlip,
	flip: flip,
	unflip: unflip,
	dice: dice,
	quote: RandomQuote,
	mute: mute,
	unmute: unmute,
	free: free,
	juice: juice,
	sleep: sleep,
	wakeup: wakeup,
	inviteLink: inviteLink,
	changeNickname: nickName,
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
};