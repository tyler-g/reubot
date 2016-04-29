// simple-event.js
// Logs a message each time the pin falls

var tessel = require('tessel');
var button = tessel.port['GPIO'].pin['G3'];

var i = 0

button.on('fall', function buttonPress () {
  i++;
  console.log('You pressed the button!', i);
});
