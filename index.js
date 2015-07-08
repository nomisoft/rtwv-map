// Import config variables
var config = require('./config');
// Import Express framework
var app = require('express')();
// Import the http module
var http = require('http').Server(app);
// Import socket.io library
var io = require('socket.io')(http);
// Import GeoIP library for converting IP's to locations
var geoip = require('geoip-lite');
// Import os module for detecting network interfaces
var os = require('os');
// Import filesystem module
var fs = require('fs');
// Import child process module for running tail in a child process
var spawn = require('child_process').spawn;

// Get the IP address of the server
var addresses = [];
var interfaces = os.networkInterfaces();
for(var k in interfaces) {
    for(var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

var tail;
// Array to hold list of files to tail
var logfiles = [];
// Loop through all the files in the given folder
fs.readdir(config.logdir, function(err, files) {
	if( files instanceof Array ) {
		files.forEach(function(filename){
			if( config.debug ) {
          		console.log('Tailing ' + filename);
          	}
			logfiles.push(config.logdir + filename);
	    });
		// Tail all the files in our logfiles array    
		tail = spawn("tail", ["-f"].concat(logfiles));
	} else {
		console.log('No log files found');
	}
});


// Request to load the homepage
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
// Request to load the countries json file
app.get('/countries.json', function(req, res){
	res.sendFile(__dirname + '/countries.json');
});
// Request to load stylesheet
app.get('/style.css', function(req, res){
	res.sendFile(__dirname + '/style.css');
});
// Request to front end javascript file
app.get('/frontend.js', function(req, res){
	res.sendFile(__dirname + '/frontend.js');
});

// Bind function to io connection event
io.on('connection', function(socket){

	// When a new line is found in the tailed files
	tail.stdout.on("data", function (data) {

		// For each new line
		var lines = data.toString().split(/(\r?\n)/g);
		lines.forEach(function(line) {

			// Perform regular expression match on the new line
			if( config.logformat == 'combined' ) {
				var format = /^(\S+) (\S+) (\S+) (\[[^\]]+\]) ("[^"]+") (\d+) (\d+) ("[^"]*") ("[^"]*").*$/;
			} else {
				var format = /^(\S+) (\S+) (\S+) (\[[^\]]+\]) ("[^"]+") (\d+) (\d+)$/;
			}
			var visit = line.match(format);

			if( visit != null && ( visit.length == 7 || visit.length == 10 ) ) {
			
				// Perform regular expression match on the request section of the log
				var request = visit[5].match(/^"(GET|POST|OPTIONS|HEAD)+ (\S+) HTTP\/1.\d+"$/);

				// if request is to a page (not image/css/js etc)
				var extension = request[2].match(/\.([0-9a-z])+$/i);
				var exclusions = ["jpg","gif","js","css","bmp","svg","png","exe","mp4","mpg","mov","ico"];
				if( extension == null || exclusions.indexOf(extension[1]) == -1 ) {

					// get lat/lng for ip address
					var geo = geoip.lookup(visit[1]);
					var server_geo = geoip.lookup(addresses[0]);

					// Create json to output to the browser
					var data = { 
						'status': visit[6],
						'url': request[2],
						'visitor': {
							'ip': visit[1],
							'geo': (geo != null && 'll' in geo) ? geo.ll : [0,0]
						},
						'server': {
							'ip': addresses[0],
							'geo': (server_geo != null && 'll' in server_geo) ? server_geo.ll : [0,0]
						}
					}

					// Send data to the browser
					io.emit('visitor', data);
					if( config.debug ) {
						console.log('Sending for '+line);
					}
				}
			}

		});

	});
});

// Open a connection listening on chosen port
http.listen(config.port, function(){
	if( config.debug ) {
		console.log('listening on *:'+config.port);
	}
});
