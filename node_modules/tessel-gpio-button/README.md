tessel-gpio-button
=============

A button on Tessel's GPIO bank.

* [Quick start](https://github.com/Frijol/tessel-button#quick-start-i-just-want-a-button)
* [Theory of buttons](https://github.com/Frijol/tessel-button#why-add-a-button-over-the-gpio)
* [Multiple buttons](https://github.com/Frijol/tessel-button#multiple-buttons)

## Quick start: I just want a button.

Your button should have two wires sticking out of it. Plug in one side to ground, and the other to pin G3.

![](https://lh5.googleusercontent.com/-VFXEUYqlb2w/VCHwX6JIsnI/AAAAAAAAKak/XS4eqXJ5RmM/w913-h514-no/20140923_151215.jpg)

Install:

```sh
npm install tessel-gpio-button
```
Use:

```js
// examples/button.js
// Count button presses

var tessel = require('tessel');
var buttonLib = require('../');
var myButton = buttonLib.use(tessel.port['GPIO'].pin['G3']);

var i = 0;

myButton.on('ready', function () {
  myButton.on('press', function () {
    i++;
    console.log('Press', i);
  });
  
  myButton.on('release', function () {
    i++;
    console.log('Release', i);
  });
});
```

Congratulations, you now have a button!

## How it works, and why

### Why add a button over the GPIO?
Buttons are a nice, easy way to make your project interactive. Tessel comes with [API access to the Config button on the board](https://tessel.io/docs/hardwareAPI#buttons). For many use cases, this is enough. But perhaps you want more buttons, or buttons with a certain look or feel. That's where this tutorial will come in handy.

### What is a button, in terms of circuits?
Electrically, a button is nothing more than a switch. One wire goes into the button; one wire comes out. When the button is pressed, the wires are connected. When not pressed, the wires are not connected.

### Making a button talk to Tessel
Tessel communicates over 3.3V. That means that its [pins](https://tessel.io/docs/hardwareAPI#pins) operate between 0V and 3.3V. For a digital pin, 3.3V evaluates to "high" or 1 (truthy), and 0V evaluates to "low" or 0 (falsy).

Tessel has six digital pins along the GPIO bank, marked G1-G6. Each of these pins is pulled high (3.3V) by default. In order to change the state of these pins from high to low, all you have to do is connect a digital pin to ground (GND).

If you have a wire, you can try it out– plug in a wire (ideally black, for ground) in to the GND pin on Tessel's GPIO bank. While running the code below, try sticking the other end of the wire into G3:

![](https://lh4.googleusercontent.com/-sgF_HmYkKLs/VCIGYOqdtcI/AAAAAAAAKdY/8PmTATEWaII/w913-h514-no/20140923_164633.jpg)

```js
// tutorial/polling-read.js
// Read Tessel's GPIO pin G3 every 100ms

var tessel = require('tessel');
var myPin = tessel.port['GPIO'].pin['G3'];

setInterval(function readPin () {
  console.log(myPin.read());
}, 100);
```

You should see a stream of ones while the wire is not plugged in, and a stream of zeroes when it is plugged in.

Okay, now let's try it with a button. It's basically the same thing. Unplug your Tessel (it's bad practice to mess around with wires while your Tessel is powered). Your button should have two wires sticking out of it. One of them should plug into GND; the other into pin G3.

![](https://lh5.googleusercontent.com/-VFXEUYqlb2w/VCHwX6JIsnI/AAAAAAAAKak/XS4eqXJ5RmM/w913-h514-no/20140923_151215.jpg)

Run the same code, and try pressing the button. You should see zeroes when the button is pressed, and ones when the button is not pressed.

### Button events

Tessel has [events](https://tessel.io/docs/hardwareAPI#api-pin-on-type-callback-time-type) for its pins. It fires an event each for `rise`, `fall`, and `change`.

Since the signal falls to low when the button is pressed, and rises to high when the button is released, it seems like you should be able to just use `pin.on(fall, function () {})`. Let's try it and see what happens:

```js
// tutorial/simple-event.js
// Logs a message each time the pin falls

var tessel = require('tessel');
var button = tessel.port['GPIO'].pin['G3'];

var i = 0

button.on('fall', function buttonPress () {
  i++;
  console.log('You pressed the button!', i);
});
```

If you have a really nice button, this might just work. However, if you have a cheap button like mine, the `fall` event will be emitted more than once per button press. This is because you are dealing with a mechanical system, and the electrical contact is actually bouncing a little bit on contact and messing up the signal. You can read about this phenomenon [here](http://en.wikipedia.org/wiki/Switch#Contact_bounce).

![](http://upload.wikimedia.org/wikipedia/commons/a/ac/Bouncy_Switch.png)

In order to correct this problem, we need to do some software debouncing.

Debouncing can be a very complicated problem if you need the ability to read the button several times a second (read a few approaches [here](http://www.embedded.com/electronics-blogs/break-points/4024981/My-favorite-software-debouncers)). However, for most applications, you can simply reduce the rate at which your events can fire.

Let's try adding a delay timer to the event:

```js
// tutorial/debounced-event.js
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
```

500ms worked well for my button, but feel free to adjust the delay and see how long it takes for your button to stop bouncing.

### Wrapping the events
For the sake of consistency, I've set up index.js of this folder [the same way we set up every module](http://blog.technical.io/post/94084496782/making-a-tessel-style-library-for-third-party-hardware), to emit an event on `press`. `press` and `release` are individually easy, but harder to have both due to our simple debouncing method.

I've done something rather interesting to get around this in index.js; feel free to check it out (and PRs welcome if you can think of a better way).

Here's some example code requiring index (or just `npm install tessel-gpio-button`):

```js
// examples/button.js
// Count button presses

var tessel = require('tessel');
var buttonLib = require('../');
var myButton = buttonLib.use(tessel.port['GPIO'].pin['G3']);

var i = 0;

myButton.on('ready', function () {
  myButton.on('press', function () {
    i++;
    console.log('Press', i);
  });
  
  myButton.on('release', function () {
    i++;
    console.log('Release', i);
  });
});
```

### Multiple buttons
Say you want more than one button. Maybe you're making a game controller, or a musical instrument or something. So you have several buttons to connect.

All you have to do is connect one side of each to ground, and the other side to a different digital pin.

![](https://lh6.googleusercontent.com/-Cr5us5zJ9SA/VCIBTDnpmqI/AAAAAAAAKcw/O-NE2P8AJOE/w913-h514-no/20140923_162433.jpg)

Then make different instances for each button. Like this:

```js
// examples/two-buttons.js
// Log button presses from two different buttons

var tessel = require('tessel');
var buttonLib = require('tessel-gpio-button');

var button1 = buttonLib.use(tessel.port['GPIO'].pin['G3']);
var button2 = buttonLib.use(tessel.port['GPIO'].pin['G2']);

button1.on('press', function () {
  console.log('Pressing button 1.');
});

button2.on('press', function () {
  console.log('Pressing button 2.');
});
```
Pressing the different buttons will give you different messages.

Note that I used a breadboard to connect several buttons to the same ground. If you're interested/want to know more about breadboards, [this](http://www.instructables.com/id/Breadboard-How-To/) is a really good place to start.

That's all! Enjoy.
