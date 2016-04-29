// Read Tessel's GPIO pin G3 every 100ms

var tessel = require('tessel');
var myPin = tessel.port['GPIO'].pin['G3'];

setInterval(function readPin () {
  console.log(myPin.read());
}, 100);
