/* Restrictive license

This license hereby grants absolutely no priveleges. You may not change, fork, or even download the code, for any purpose whatsover,
personal or commercial. You may look at it for no more than twelve (12) seconds at a time, and you must count in such a manner: one thousand one,
one thousand two, one thousand three, etc. , ad. nauseum.

If your name starts with an R, you must not look at the code for more than seven (7) seconds at a time, taking every measure possible to prevent
illegal overviewing, either by alt tabbing away or other methods.

Under no circumstances ever can you violate any of these provisions without express written consent from the true owner, sealed with a drop of blood

*/

require('dotenv').config();

// Import the interface to Tessel hardware
var tessel = require('tessel');

//pins with interrupts: A2,A5-A7,B2,B5-B7 (8 total)
var reuButtons = {
  0 : {
    'btn' : tessel.port.A.pin[2],
    'msg' : 'I :heart: Bernie'
  },
  1 : {
    'btn' : tessel.port.A.pin[5],
    'msg' : 'BOOM!, :reub:'
  },
  2 : {
    'btn' : tessel.port.A.pin[6],
    'msg' : 'Thank you, :reub:'
  },
  3 : {
    'btn' : tessel.port.A.pin[7],
    'msg' : 'Is there a ticket for that?'
  },
  4 : {
    'btn' : tessel.port.B.pin[2],
    'msg' : 'I love my boss, :reub:'
  },
  5 : {
    'btn' : tessel.port.B.pin[5],
    'msg' : 'Yours truly, :reub:'
  }
};
var reuButtonsLength = 6;

var reuSwitches = {
  0 : {
    'switch' : tessel.port.B.pin[6]
  },
  1 : {
    'switch' : tessel.port.B.pin[7],
    'channel0' : 'banter',
    'channel1' : 'bi-tech'
  }
}
var reuSwitchesLength = 2;

/*
for (var i = 0; i < reuPins.length; i++) {
  reuButtons[i]['btn'] = buttonLib.use(reuPins[i]);
}
*/

var SlackBot = require('slackbots');

console.log(process.env);
var config = {
  'name'  : 'Reubot',
  'channel' : 'reubot-chat'
};

var debug = false;
var switchLock = false;
var masterLock = true;
var buttonLock = true;

//all LEDs off
tessel.led[0].off();
tessel.led[1].off();
tessel.led[2].off();
tessel.led[3].off();

//bind button events
for (var i = 0; i < reuButtonsLength; i++) {
  (function(i){
    reuButtons[i]['btn'].on('change', function() {
      if (buttonLock) { return; }
      buttonLock = true;
      this.rawRead(function(err, val) {
        buttonLock = false;
        if (val === 0) {
          console.log('press ' + i);
        }
        else {
          console.log('release ' + i);
          postToSlack(reuButtons[i]['msg']);
        }
      });
    });
  }(i));
}

//bind switch events
reuSwitches[0]['switch'].on('change', function() {
  if (switchLock) { return; }
  switchLock = true;
  this.rawRead(function(err, val) {
    switchLock = false;
    console.log('val:', val);
    if (val === 0) {
      console.log('masterLock on');
      masterLock = true;
    }
    else {
      console.log('masterLock off');
      masterLock = false;
    }
  });
});
reuSwitches[1]['switch'].on('change', function() {
  if (switchLock) { return; }
  switchLock = true;
  this.rawRead(function(err, val) {
    switchLock = false;
    if (val === 0) {
      config.channel = reuSwitches[1]['channel0'];
    }
    else {
      config.channel = reuSwitches[1]['channel1'];

    }
    console.log('channel now: ' + config.channel);
  });
});

//gpio-buttons library bindings
//button 0
/*
reuButtons[0]['btn'].on('ready', function () {
  console.log('button 0 ready');
  reuButtons[0]['btn'].on('press', function () {
    console.log('press 0');
  });
  reuButtons[0]['btn'].on('release', function () {
    console.log('release 0');
    //postToSlack(reuButtons[0]['msg']);
  });
});
*/

// create a bot
var bot = new SlackBot({
    token: process.env.SLACK_TOKEN,
    name: config.name
});

//bind to bot methods
bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };
    // define existing username instead of 'user_name'
    //bot.postMessageToUser('user_name', 'meow!', params);
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    //only continue on non-bot messages (so we don't create infinite loop)
    if (data.type === 'message' && typeof data.bot_id === 'undefined') {
      //post to channel
      postToSlack();
    }
});

//custom functions
function postToSlack(msg){
  if (masterLock) { return false; }
  bot.postTo(config.channel, msg,
  function(data){
    console.log('success');
    //blink(1, 500);
  });
}

function blink(led, duration) {
  setTimeout(function(){
    clearInterval(blinker);
    tessel.led[led].off();
  }, duration);
  var blinker = setInterval(function(){
    tessel.led[led].toggle();
  }, 50);
}

//for bypassing posting to slack
if (debug) {
  postToSlack = console.log;
}

//workaround for the immediately firing .on('change') events
setTimeout(function(){
    buttonLock=false;
}, 1000);

console.log('start');
