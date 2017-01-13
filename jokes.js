const http = require('http');

// host: 'api.chucknorris.io',
// path: '/jokes/random'
// http://api.icndb.com/jokes/random
var options = {
	protocol: 'http:',
	port: 80,
	method: 'GET',
	host: 'api.icndb.com',
	path: '/jokes/random'
};

function getJoke(callBack) {

	var request = http.request(options, function(response) {

		var result = '';
		response.on('data', function(data) {
			result += data;
		});

		response.on('end', function() {
			callBack(result);
		});
	});

	request.end();
};

getJoke(function(joke) {
	console.log(joke);
	//console.log(JSON.parse(joke));
});

module.exports = getJoke;