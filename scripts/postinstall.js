#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var srcFile   = path.normalize(__dirname + '/../config/jwtauth.js');
var destFile = path.normalize(process.cwd() + '/../../config/jwtauth.js');

if(!fs.existsSync(destFile)) {
  console.log("Copying " + srcFile + " to " + destFile);
  fs.createReadStream(srcFile).pipe(fs.createWriteStream(destFile));
}