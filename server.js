var sys = require('sys');
	ws = require('./lib/ws');
	events = require('events');
	http = require('http');

var httpClient = http.createClient(80, "search.twitter.com");
var clients = [];

var query = "?q=%23haiku";

function getTweets(){
	var searchurl ="/search.json" + query;
	sys.debug(searchurl);
	
	var request = httpClient.request("GET", searchurl, {'Host' : "search.twitter.com"});
	request.end();
	request.on('response', function(response){
		var body = "";
		response.addListener('data', function(chunk){
			sys.debug('data...');
			body += chunk;
		});

		response.addListener('end', function(){
			sys.debug('end...');
			console.log(JSON.parse(body));
			var tweets = JSON.parse(body);
			query = tweets.refresh_url;
			clients.forEach(function(c){
				c.write(JSON.stringify(tweets));
			});
		});
	});
	request.end();
} // end of getTweets

//getTweets();
//setInterval(getTweets, 10000);
ws.createServer(function(websocket){
	clients.push(websocket);
	
	websocket.addListener('connect', function(resource){
		sys.debug('connect: ' + resource);
	}).addListener('data', function(data){
		sys.debug('data: ' + data);
	}).addListener('close', function(){
		if (clients.length > 0){
			clients.pop(websocket);
		}
	});
}).listen(8002);
