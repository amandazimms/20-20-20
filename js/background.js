let countdown = 0; //countown - when finished, time to either start or stop looking
let isTakingBreak = false; //BREAK, throughout, refers to looking away, e.g. practicing 20-20-20

const timeBetweenBreaks = 10; //how long between looks - 20 minutes = 1200 seconds
const breakDuration = 5; //how long to look - 20 seconds

let countdownID; //used to start and stop countdowns

setCountdownTilBreak();

//PHASE 1: START the first timer, WAIT til user is ready to look away from the screen
function setCountdownTilBreak(){
  //function that counts down until time to look every other time.
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);
  chrome.notifications.clear('timeToBreak');
  countdown = timeBetweenBreaks;
  isTakingBreak = false;
  
  //using this setup to SEND isTakingBreak to popup
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "isBreakStatus") {
        sendResponse({ method: "", data: isTakingBreak }) 
    }
  })

  countdownID = setInterval(() => { //countdown til 0, then make a notification
    
    console.log ('in setInterval. time til next break is', countdown);
    if (countdown > 0) {
      countdown--;
    }
    else {
      makeBreakNotification();
      clearInterval(countdownID);
      return;
    }

    //using this setup to SEND timeUntilNextLook to popup for display there
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "timeTilBreakStatus") {
          sendResponse({ method: "", data: countdown }) 
      }
    })
  }, 1000); //runs every 1 second
}

//PHASE 2: MAKE a "take a break" notification for user
function makeBreakNotification(){
  chrome.notifications.create('timeToBreak', {
    type: 'basic',
    iconUrl: '/Eye128.png',
    title: 'Time to look!',
    message: 'Focus on something at least 20 feet away, for 20 seconds',
    priority: 2
  });
}
 
//PHASE 3: WHEN for user indicates they're ready to take a break
    //3a: 1st of 2 things that can mean user has begun looking: clicked to clear popup
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  setCountdownTilScreen();
});

    //3b: 2nd of 2 things that can mean user has begun looking: clicked "take a break (early)"
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //using this setup to RECEIVE "true" from popup (re: click "take a break" = true)
  if (request.method == "takeBreakStatus" && request.data === true) { 
    setCountdownTilScreen();
      sendResponse({ method: "", data: "" })
  }
});

//PHASE 4: START countown until screen time (i.e. until break is over)
function setCountdownTilScreen(){
  //function that counts down until time to stop looking away
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);
  countdown = breakDuration;
  isTakingBreak = true;

  //using this setup to SEND isTakingBreak to popup
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "isBreakStatus") {
        sendResponse({ method: "", data: isTakingBreak }) 
    }
  })

  countdownID = setInterval(() => { //countdown til 0, then reset the timer to 20
    
    console.log ('in setInterval. time til back to work is', countdown);
    if (countdown > 0) {
      countdown--;
    }
    else {
      setCountdownTilBreak(countdownID);
      return;
    }

    //using this setup to SEND countdown to popup for display there
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "timeTilBreakOverStatus") {
          sendResponse({ method: isTakingBreak, data: countdown }) 
      }
    })
  }, 1000); //runs every 1 second
}


