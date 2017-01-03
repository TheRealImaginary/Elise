var fs = require('fs');
const SAVE_PATH = './currency.json';
var saved_data;
load();

//TODO : Save users in file/db.
var currencyManager = function() {
	this.users = {};
	if (saved_data)
		this.users = saved_data;
};

currencyManager.currency_name = 'Blobs';
currencyManager.currency_symbol = '!!';

//TODO : Save Name and Symbol when changed in file.
currencyManager.setName = function(name) {
	currencyManager.currency_name = name;
};

currencyManager.setSymbol = function(symbol) {
	currencyManager.currency_symbol = symbol;
};

currencyManager.prototype.get = function(user) {
	return this.add(user, 0);
};

currencyManager.prototype.add = function(user, amount) {
	if (!this.users[user.username])
		this.users[user.username] = 0;
	this.users[user.username] += amount;
	save(this.users);
	return this.users[user.username];
};

currencyManager.prototype.spend = function(user, amount) {
	if (!this.users[user.username])
		this.users[user.username] = 0;
	if (amount > this.users[user.username])
		return {
			success: false
		};
	this.users[user.username] -= amount;
	save(this.users);
	return {
		amount: this.users[user.username],
		success: true
	};
};

function save(data) {
	fs.writeFile(SAVE_PATH, JSON.stringify(data), function(err) {
		if (err)
			throw err;
		console.log('Saved!');
	});
};

function load() {
	try {
		saved_data = require(SAVE_PATH);
	} catch (err) {}
};

module.exports = currencyManager;