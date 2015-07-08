# Real-Time Website Visitors Map

A real time website visitors map showing a server or websites traffic created by tailing log files

![Real-Time Website Visitors Map screenshot](screenshot.png?raw=true)

## Requirements

NodeJs

## Usage

Pull the repository or download the zip to your chosen folder, then run the following 
```
npm install
nodejs index.js
```
Then visit localhost:3000 in your browser

## Configuration

There are 4 configuration settings
* port: the port you wish to run the application on
* logformat: your log file format, common or combined
* logdir: the folder containing your log files
* debug: whether or not to output the log data to the terminal
