// examples/two-buttons.js
// Log button presses from two different buttons

var tessel = require('tessel');
var buttonLib = require('../');

var button1 = buttonLib.use(tessel.port['GPIO'].pin['G3']);
var button2 = buttonLib.use(tessel.port['GPIO'].pin['G2']);

button1.on('press', function () {
  console.log('Pressing button 1.');
});

button2.on('press', function () {
  console.log('Pressing button 2.');
});
