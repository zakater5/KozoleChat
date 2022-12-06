
const fs = require('fs');

var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});

class Logger {
    log(logString){
        var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        logger.write(timeStamp + " / " + logString + "\r\n");
    }
}

module.exports = Logger;