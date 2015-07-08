var config = {}

// Port to run the application on
config.port = 3000;

// Log file format - either combined or common
config.logformat = 'combined';

// Directory of the log files to parse
config.logdir = '/usr/local/apache/domlogs/';

// Debugging mode outputs details to console - either true or false
config.debug = false;

module.exports = config;