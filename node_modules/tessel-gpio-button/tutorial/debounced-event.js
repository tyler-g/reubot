// debounced-event.js
// Logs a message at button presses that are sufficiently spaced

var tessel = require('tessel');
var button = tessel.port['GPIO'].pin['G3'];

var delay = 500; // Let's try every 500ms
var ready = true;

var i = 0

button.on('fall', function () {
  if(ready) {
    buttonPress();
  }
});

function buttonPress () {
  i++;
  console.log('You pressed the button!', i);
  
  // Set a delay timer
  ready = false;
  setTimeout(function () {
    ready = true;
  }, delay);
}
